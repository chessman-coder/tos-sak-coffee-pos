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
            $bakongAccountID = config('services.bakong.merchantID') ?: 'merchant@bakong';
            $merchantName = config('services.bakong.merchantName') ?: 'Merchant Name';
            $merchantCity = config('services.bakong.merchantCity') ?: 'Phnom Penh';

            $individualInfo = new IndividualInfo(
                bakongAccountID: $bakongAccountID,
                merchantName: $merchantName,
                merchantCity: $merchantCity,
                currency: KHQRData::CURRENCY_USD,
                amount: $amount,
                billNumber: $billNumber,
                purposeOfTransaction: $description
            );

            $khqrResponse = BakongKHQR::generateIndividual($individualInfo);
            $qrData = $khqrResponse->data;

            if ($request->wantsJson() || !$request->acceptsHtml()) {
                return response()->json([
                    'success' => true,
                    'qr_code' => $qrData['qr'],
                    'md5' => $qrData['md5'],
                    'amount' => $amount,
                    'currency' => 'USD',
                    'bill_number' => $billNumber,
                    'description' => $description,
                ]);
            }

            return Inertia::render('Payment/Checkout', [
                'qr_code' => $qrData['qr'],
                'md5' => $qrData['md5'],
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
}