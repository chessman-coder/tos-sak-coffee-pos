<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use KHQR\BakongKHQR;
use KHQR\Helpers\KHQRData;
use KHQR\Models\IndividualInfo;

class PaymentController extends Controller
{
    public function checkout(Request $request, $id)
    {
        // Try to find by Order first, then Product
        $order = Order::find($id);
        $amount = 0.0;
        $billNumber = null;
        $description = '';

        if ($order) {
            $amount = (float) $order->total_amount;
            $billNumber = $order->order_number;
            $description = "Payment for Order " . $order->order_number;
        } else {
            $product = Product::find($id);
            if ($product) {
                $amount = (float) $product->price;
                $description = "Payment for " . $product->name;
            } else {
                if ($request->wantsJson()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Order or Product not found.'
                    ], 404);
                }
                abort(404, 'Order or Product not found.');
            }
        }

        try {
            $bakongAccountID = config('services.bakong.merchantID') ?: env('BAKONG_MERCHANT_ID', 'dara_ly@bkrt');
            $merchantName = config('services.bakong.merchantName') ?: 'Merchant Name';
            $merchantCity = config('services.bakong.merchantCity') ?: 'Phnom Penh';
            $storeName = env('BAKONG_STORE_NAME', 'Tos Sak');
            $mobile = config('services.bakong.merchantMobile') ?: env('BAKONG_MERCHANT_MOBILE', '077906536');
            $terminal = env('BAKONG_TERMINAL_LABEL', 'WebQR');

            // 1. Use the library's IndividualInfo model to format parameters and data
            $individualInfo = new IndividualInfo(
                bakongAccountID: $bakongAccountID,
                merchantName: $merchantName,
                merchantCity: $merchantCity,
                currency: KHQRData::CURRENCY_USD,
                amount: $amount,
                billNumber: $billNumber,
                storeLabel: $storeName,
                terminalLabel: $terminal,
                mobileNumber: $mobile,
                purposeOfTransaction: $description
            );

            // 2. Generate the base KHQR code using the BakongKHQR library
            $khqrResponse = BakongKHQR::generateIndividual($individualInfo);
            $qrData = $khqrResponse->data;
            $baseQrString = $qrData['qr'];

            // 3. Post-process to inject subtag 01 (expiration) under tag 99 (timestamps)
            // since the library's default Timestamp generation only appends subtag 00.
            $nowMs = (int) floor(microtime(true) * 1000);
            $expireMs = $nowMs + (10 * 60 * 1000); // 10 minutes expiry

            $sub99_00 = $this->formatTag('00', (string) $nowMs);
            $sub99_01 = $this->formatTag('01', (string) $expireMs);
            $tag99Value = $sub99_00 . $sub99_01;
            $newTag99 = $this->formatTag('99', $tag99Value);

            // Strip the existing tag 99 and CRC from the end of the base string
            // Base string format ends with: 99[length][value]6304[crc]
            $qrWithoutCrcAnd99 = preg_replace('/99\d{2}00\d{15}.*$/', '', $baseQrString);
            if (empty($qrWithoutCrcAnd99) || $qrWithoutCrcAnd99 === $baseQrString) {
                // Fallback: strip last 4 chars (CRC) and manual strip tag 99
                $qrWithoutCrc = substr($baseQrString, 0, -4);
                $qrWithoutCrcAnd99 = preg_replace('/99\d{2}00\d{15}/', '', $qrWithoutCrc);
            }

            // Append the new tag 99 and the CRC starter "6304"
            $adjustedQrWithoutCrc = $qrWithoutCrcAnd99 . $newTag99 . '6304';
            
            // Recalculate CRC using the library's helper method
            $newCrc = \KHQR\Helpers\Utils::crc16($adjustedQrWithoutCrc);
            $qrCodeString = $adjustedQrWithoutCrc . $newCrc;
            $md5Hash = md5($qrCodeString);

            if ($request->wantsJson() || !$request->acceptsHtml()) {
                return response()->json([
                    'success' => true,
                    'qr_code' => $qrCodeString,
                    'md5' => $md5Hash,
                    'amount' => $amount,
                    'currency' => 'USD',
                    'bill_number' => $billNumber,
                    'description' => $description,
                ]);
            }

            return Inertia::render('Payment/Checkout', [
                'order_id' => $order ? $order->id : null,
                'qr_code' => $qrCodeString,
                'md5' => $md5Hash,
                'amount' => $amount,
                'bill_number' => $billNumber,
                'description' => $description,
            ]);
        } catch (\Exception $e) {
            if ($request->wantsJson() || !$request->acceptsHtml()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bakong KHQR Generation failed: ' . $e->getMessage()
                ], 500);
            }
            return back()->withErrors(['error' => 'Bakong KHQR Generation failed: ' . $e->getMessage()]);
        }
    }

    public function checkStatus(Request $request, $id)
    {
        $order = Order::find($id);
        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found.'
            ], 404);
        }

        // If the order status is already completed, preparing, ready, or finish, it means it was paid/processed
        if (in_array($order->status, ['completed', 'preparing', 'ready', 'finish'])) {
            return response()->json([
                'success' => true,
                'status' => $order->status,
                'message' => 'Payment was already processed successfully.'
            ]);
        }

        $md5 = $request->query('md5');

        if (!$md5) {
            return response()->json([
                'success' => false,
                'message' => 'MD5 hash is required.'
            ], 400);
        }

        try {
            $token = config('services.bakong.token') ?: env('BAKONG_SECRET_KEY');
            if (empty($token) || $token === 'YOUR_BAKONG_TOKEN') {
                throw new \Exception("Bakong API Token is not configured.");
            }

            $bakongKhqr = new BakongKHQR($token);
            $response = $bakongKhqr->checkTransactionByMD5($md5);

            \Illuminate\Support\Facades\Log::info('Bakong Check Transaction Response', [
                'order_id' => $id,
                'md5' => $md5,
                'response' => $response
            ]);

            if (isset($response['responseCode']) && $response['responseCode'] === 0) {
                // Payment was successful! Update the order status.
                $order->update([
                    'status' => 'preparing',
                    'payment_method' => 'khqr'
                ]);

                return response()->json([
                    'success' => true,
                    'status' => 'preparing',
                    'message' => 'Payment successful!'
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => $response['responseMessage'] ?? 'Payment pending.'
            ]);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Bakong payment check failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'error_type' => 'API_ERROR',
                'message' => 'Unable to verify payment status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Helper to format an EMVCo tag (Tag-Length-Value format)
     */
    private function formatTag(string $tag, string $value): string
    {
        $length = str_pad((string) strlen($value), 2, '0', STR_PAD_LEFT);
        return $tag . $length . $value;
    }
}