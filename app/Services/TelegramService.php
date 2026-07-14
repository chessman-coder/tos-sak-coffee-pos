<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use App\Models\Inventory;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramService
{
    protected string $paymentBotToken;
    protected string $receiverOrderBotToken;
    protected string $saleReportBotToken;
    protected string $lowStockBotToken;
    protected string $paymentChatId;
    protected string $receiverChatId;
    protected string $saleReportChatId;
    protected string $lowStockChatId;

    public function __construct()
    {
        $this->paymentBotToken = config('services.telegram.payment_bot_token') ?: '';
        $this->receiverOrderBotToken = config('services.telegram.receiver_order_bot_token') ?: '';
        $this->saleReportBotToken = config('services.telegram.sale_report_bot_token') ?: '';
        $this->lowStockBotToken = config('services.telegram.low_stock_bot_token') ?: '';

        $settingsPath = storage_path('app/telegram_settings.json');
        if (file_exists($settingsPath)) {
            $settings = json_decode(file_get_contents($settingsPath), true) ?: [];
            $this->paymentChatId = $settings['payment_chat_id'] ?? $settings['chat_id'] ?? config('services.telegram.chat_id') ?: '';
            $this->receiverChatId = $settings['receiver_chat_id'] ?? $settings['chat_id'] ?? config('services.telegram.chat_id') ?: '';
            $this->saleReportChatId = $settings['sale_report_chat_id'] ?? $settings['chat_id'] ?? config('services.telegram.chat_id') ?: '';
            $this->lowStockChatId = $settings['low_stock_chat_id'] ?? $settings['chat_id'] ?? config('services.telegram.chat_id') ?: '';
        } else {
            $this->paymentChatId = config('services.telegram.chat_id') ?: '';
            $this->receiverChatId = config('services.telegram.chat_id') ?: '';
            $this->saleReportChatId = config('services.telegram.chat_id') ?: '';
            $this->lowStockChatId = config('services.telegram.chat_id') ?: '';
        }
    }

    /**
     * Save the Chat ID to storage.
     *
     * @param string $chatId
     * @param string $botType
     * @return void
     */
    public function saveChatId(string $chatId, string $botType = 'payment'): void
    {
        $settingsPath = storage_path('app/telegram_settings.json');
        $dir = dirname($settingsPath);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $settings = [];
        if (file_exists($settingsPath)) {
            $settings = json_decode(file_get_contents($settingsPath), true) ?: [];
        }

        if ($botType === 'receiver') {
            $settings['receiver_chat_id'] = $chatId;
            $this->receiverChatId = $chatId;
        } elseif ($botType === 'report') {
            $settings['sale_report_chat_id'] = $chatId;
            $this->saleReportChatId = $chatId;
        } elseif ($botType === 'low_stock') {
            $settings['low_stock_chat_id'] = $chatId;
            $this->lowStockChatId = $chatId;
        } else {
            $settings['payment_chat_id'] = $chatId;
            $this->paymentChatId = $chatId;
        }

        file_put_contents($settingsPath, json_encode($settings, JSON_PRETTY_PRINT));
    }

    /**
     * Send a plain text or HTML message to a specific Chat ID.
     *
     * @param string $chatId
     * @param string $text
     * @param string $botType
     * @return bool
     */
    public function sendTextMessage(string $chatId, string $text, string $botType = 'payment'): bool
    {
        if ($botType === 'receiver') {
            $token = $this->receiverOrderBotToken;
        } elseif ($botType === 'report') {
            $token = $this->saleReportBotToken;
        } elseif ($botType === 'low_stock') {
            $token = $this->lowStockBotToken;
        } else {
            $token = $this->paymentBotToken;
        }

        if (empty($token)) {
            Log::warning("Telegram Bot Token for {$botType} is not configured.");
            return false;
        }

        try {
            $url = "https://api.telegram.org/bot{$token}/sendMessage";
            $response = Http::timeout(10)->post($url, [
                'chat_id' => $chatId,
                'text' => $text,
                'parse_mode' => 'HTML',
            ]);

            if ($response->failed()) {
                Log::error("Telegram API sendTextMessage ({$botType}) failed: " . $response->body());
                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error("Failed to send Telegram text message ({$botType}): " . $e->getMessage());
            return false;
        }
    }

    /**
     * Send a payment alert for an order to Telegram.
     *
     * @param Order $order
     * @return bool
     */
    public function sendOrderPaymentAlert(Order $order): bool
    {
        if (empty($this->paymentBotToken) || empty($this->paymentChatId)) {
            Log::warning('Telegram payment bot credentials are not configured. Payment alert skipped.');
            return false;
        }

        // Load necessary relationships
        $order->loadMissing(['items.product', 'items.options']);

        // Build HTML Message
        $htmlMessage = "✅ <b>New Payment Received!</b>\n\n";
        $htmlMessage .= '📅 <b>Date:</b> ' . e($order->order_date) . "\n";
        $htmlMessage .= '📦 <b>Order Number:</b> #<code>' . e($order->order_number) . "</code>\n";
        $htmlMessage .= '🍽️ <b>Order Type:</b> ' . e($order->order_type) . ' (' . e($order->order_method) . ")\n";
        $htmlMessage .= '💳 <b>Payment Method:</b> ' . e(strtoupper($order->payment_method)) . "\n";
        $htmlMessage .= '💵 <b>Total Paid:</b> $' . number_format($order->total_amount, 2) . "\n";

        // if (!empty($order->notes)) {
        //     $htmlMessage .= '📝 <b>Notes:</b> <i>' . e($order->notes) . "</i>\n";
        // }

        // $htmlMessage .= "\n🛒 <b>Order Items:</b>\n";

        // foreach ($order->items as $item) {
        //     $productName = $item->product ? $item->product->name : 'Unknown Product';
        //     $htmlMessage .= '• <b>' . e($productName) . '</b> (x' . $item->quantity . ') - $' . number_format($item->line_total, 2) . "\n";

        //     $specDetails = [];
        //     if ($item->size) {
        //         $specDetails[] = 'Size: ' . e($item->size);
        //     }
        //     if ($item->type) {
        //         $specDetails[] = 'Type: ' . e($item->type);
        //     }

        //     if (!empty($specDetails)) {
        //         $htmlMessage .= '  <i>' . implode(' | ', $specDetails) . "</i>\n";
        //     }

        //     if ($item->options->isNotEmpty()) {
        //         $htmlMessage .= "  Options: \n";
        //         foreach ($item->options as $option) {
        //             $htmlMessage .= '       - ' . e($option->option_label) . ': ' . e($option->value_label) . "\n";
        //         }
        //     }

        //     if (!empty($item->notes)) {
        //         $htmlMessage .= '  Note: <i>' . e($item->notes) . "</i>\n";
        //     }
        // }

        try {
            $url = "https://api.telegram.org/bot{$this->paymentBotToken}/sendMessage";
            $response = Http::timeout(10)->post($url, [
                'chat_id' => $this->paymentChatId,
                'text' => $htmlMessage,
                'parse_mode' => 'HTML',
            ]);

            if ($response->failed()) {
                Log::error('Telegram API request failed: ' . $response->body());
                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to send Telegram alert: ' . $e->getMessage());
            return false;
        }
    }

    public function sendReceiverOrderAlert(Order $order): bool
    {
        if (empty($this->receiverOrderBotToken) || empty($this->receiverChatId)) {
            Log::warning('Telegram receiver order bot credentials are not configured. Receiver alert skipped.');
            return false;
        }

        // Build HTML Message
        $htmlMessage = "🔔 <b>New Order Received!</b>\n\n";
        $htmlMessage .= '📦 <b>Order Number:</b> #<code>' . e($order->order_number) . "</code>\n";
        $htmlMessage .= '👤 <b>Customer Name:</b> ' . e($order->customer_name) . "\n";
        $htmlMessage .= '📞 <b>Phone Number:</b> ' . e($order->phone_number) . "\n";
        $htmlMessage .= '🍽️ <b>Order Type:</b> ' . e($order->order_type) . ' (' . e($order->order_method) . ")\n";
        $htmlMessage .= '💵 <b>Total Paid:</b> $' . number_format($order->total_amount, 2) . "\n";
        $htmlMessage .= '📅 <b>Date:</b> ' . e($order->order_date) . "\n";

        if (!empty($order->notes)) {
            $htmlMessage .= '📝 <b>Notes:</b> <i>' . e($order->notes) . "</i>\n";
        }

        $htmlMessage .= "\n🛒 <b>Order Items:</b>\n";

        foreach ($order->items as $item) {
            $productName = $item->product ? $item->product->name : 'Unknown Product';
            $htmlMessage .= '• <b>' . e($productName) . '</b> (x' . $item->quantity . ') - $' . number_format($item->line_total, 2) . "\n";

            $specDetails = [];
            if ($item->size) {
                $specDetails[] = 'Size: ' . e($item->size);
            }
            if ($item->type) {
                $specDetails[] = 'Type: ' . e($item->type);
            }

            if (!empty($specDetails)) {
                $htmlMessage .= '  <i>' . implode(' | ', $specDetails) . "</i>\n";
            }

            if ($item->options->isNotEmpty()) {
                $htmlMessage .= "  Options: \n";
                foreach ($item->options as $option) {
                    $htmlMessage .= '       - ' . e($option->option_label) . ': ' . e($option->value_label) . "\n";
                }
            }

            if (!empty($item->notes)) {
                $htmlMessage .= '  Note: <i>' . e($item->notes) . "</i>\n";
            }
        }

        try {
            $url = "https://api.telegram.org/bot{$this->receiverOrderBotToken}/sendMessage";
            $response = Http::timeout(10)->post($url, [
                'chat_id' => $this->receiverChatId,
                'text' => $htmlMessage,
                'parse_mode' => 'HTML',
            ]);

            if ($response->failed()) {
                Log::error('Telegram API request failed: ' . $response->body());
                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to send Telegram alert: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Send a daily sale report to the Telegram sale report channel.
     *
     * @param string|null $date
     * @return bool
     */
    public function sendDailySaleReport(?string $date = null): bool
    {
        $date = $date ?? now()->format('Y-m-d');

        if (empty($this->saleReportBotToken) || empty($this->saleReportChatId)) {
            Log::warning('Telegram sale report bot credentials are not configured. Daily sale report skipped.');
            return false;
        }

        // Get paid orders for the specified date
        $orders = Order::whereDate('order_date', $date)
            ->whereIn('status', ['pending', 'preparing', 'ready', 'completed'])
            ->get();

        $totalRevenue = (float)$orders->sum('total_amount');
        $totalOrders = $orders->count();

        $cashOrders = $orders->where('payment_method', 'cash');
        $totalCash = (float)$cashOrders->sum('total_amount');
        $countCash = $cashOrders->count();

        $khqrOrders = $orders->where('payment_method', 'khqr');
        $totalKhqr = (float)$khqrOrders->sum('total_amount');
        $countKhqr = $khqrOrders->count();

        // Build HTML Message
        $htmlMessage = "📊 <b>Daily Sale Report</b> (" . e($date) . ")\n";
        $htmlMessage .= "====================\n\n";
        $htmlMessage .= "💵 <b>Total Revenue:</b> $" . number_format($totalRevenue, 2) . "\n";
        $htmlMessage .= "📦 <b>Total Orders:</b> " . $totalOrders . "\n\n";
        
        $htmlMessage .= "💳 <b>Payment Methods:</b>\n";
        $htmlMessage .= "  • <b>KHQR:</b> $" . number_format($totalKhqr, 2) . " (" . $countKhqr . " orders)\n";
        $htmlMessage .= "  • <b>Cash:</b> $" . number_format($totalCash, 2) . " (" . $countCash . " orders)\n";

        try {
            $url = "https://api.telegram.org/bot{$this->saleReportBotToken}/sendMessage";
            $response = Http::timeout(10)->post($url, [
                'chat_id' => $this->saleReportChatId,
                'text' => $htmlMessage,
                'parse_mode' => 'HTML',
            ]);

            if ($response->failed()) {
                Log::error('Telegram API daily report failed: ' . $response->body());
                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to send Telegram daily report: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Send a low stock alert for products and/or inventory items to Telegram.
     *
     * @param mixed|null $item Optional Product or Inventory instance to alert for a single item.
     * @param int|null $threshold Custom low stock threshold for products (default: 5).
     * @return bool
     */
    public function sendLowStockAlert($item = null, ?int $threshold = null): bool
    {
        $threshold = $threshold ?? config('services.telegram.low_stock_threshold', 5);

        // Determine which bot credentials to use (dedicated low stock bot)
        $botType = 'low_stock';
        $chatId = $this->lowStockChatId;
        $token = $this->lowStockBotToken;

        if (empty($token) || empty($chatId)) {
            Log::warning('Telegram low stock bot credentials are not configured. Low stock alert skipped.');
            return false;
        }

        $htmlMessage = '';

        if ($item !== null) {
            // Case 1: Alert for a specific single item
            if ($item instanceof Product) {
                $stock = $item->stock ?? 0;
                if ($stock > $threshold) {
                    return false; // Not low stock
                }
                $htmlMessage = "⚠️ <b>Low Stock Alert!</b>\n\n";
                $htmlMessage .= "📦 <b>Product:</b> " . e($item->name) . "\n";
                if ($item->category) {
                $htmlMessage .= "📋 <b>Category:</b> " . e($item->category->parent->name) . "\n";
                }
                $htmlMessage .= "🔴 <b>Current Stock:</b> " . $stock . "\n";
            } elseif ($item instanceof Inventory) {
                $stock = $item->stock ?? 0;
                $reorderLevel = $item->reorder_level ?? 0;
                if ($stock > $reorderLevel) {
                    return false; // Not low stock
                }
                $htmlMessage = "⚠️ <b>Low Stock Alert!</b>\n\n";
                $htmlMessage .= "📋 <b>Inventory Item:</b> " . e($item->name) . "\n";
                $htmlMessage .= "🔴 <b>Current Stock:</b> " . $stock . " " . e($item->unit ?? 'units') . "\n";
                if ($item->category) {
                    $htmlMessage .= "ℹ️ <b>Category:</b> " . e($item->category) . "\n";
                }
                if ($item->supplier) {
                    $htmlMessage .= "🤝 <b>Supplier:</b> " . e($item->supplier) . "\n";
                }
            } else {
                Log::warning('Unsupported item type passed to sendLowStockAlert: ' . (is_object($item) ? get_class($item) : gettype($item)));
                return false;
            }
        } else {
            // Case 2: Scan database and alert for all low stock items
            $lowStockProducts = Product::whereNotNull('stock')
                ->where('stock', '<=', $threshold)
                ->get();

            $lowStockInventories = Inventory::whereColumn('stock', '<=', 'reorder_level')
                ->get();

            if ($lowStockProducts->isEmpty() && $lowStockInventories->isEmpty()) {
                return true; // Nothing is low stock, no alert needed
            }

            $htmlMessage = "⚠️ <b>Low Stock Alert Summary</b>\n";
            $htmlMessage .= "====================\n\n";

            if ($lowStockProducts->isNotEmpty()) {
                $htmlMessage .= "📦 <b>Products:</b>\n";
                foreach ($lowStockProducts as $product) {
                    $spec = [];
                    if ($product->size) $spec[] = $product->size;
                    if ($product->type) $spec[] = $product->type;
                    $specStr = !empty($spec) ? ' (' . implode(' | ', $spec) . ')' : '';
                    
                    $htmlMessage .= "• " . e($product->name) . $specStr . ": <b>" . $product->stock . "</b> left (Threshold: " . $threshold . ")\n";
                }
                $htmlMessage .= "\n";
            }

            if ($lowStockInventories->isNotEmpty()) {
                $htmlMessage .= "📋 <b>Inventory Items:</b>\n";
                foreach ($lowStockInventories as $inventory) {
                    $unit = $inventory->unit ? ' ' . $inventory->unit : '';
                    $htmlMessage .= "• " . e($inventory->name) . ": <b>" . $inventory->stock . "</b>" . $unit . " left (Reorder: " . $inventory->reorder_level . $unit . ")\n";
                }
            }
        }

        if (empty($htmlMessage)) {
            return false;
        }

        return $this->sendTextMessage($chatId, $htmlMessage, $botType);
    }

    /**
     * Send a sales report to Telegram for a specific period.
     *
     * @param string $htmlMessage
     * @return bool
     */
    public function sendPeriodSalesReport(string $htmlMessage): bool
    {
        if (empty($this->saleReportBotToken) || empty($this->saleReportChatId)) {
            Log::warning('Telegram sale report bot credentials are not configured.');
            return false;
        }

        try {
            $url = "https://api.telegram.org/bot{$this->saleReportBotToken}/sendMessage";
            $response = Http::timeout(10)->post($url, [
                'chat_id' => $this->saleReportChatId,
                'text' => $htmlMessage,
                'parse_mode' => 'HTML',
            ]);

            if ($response->failed()) {
                Log::error('Telegram API sendPeriodSalesReport failed: ' . $response->body());
                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to send Telegram sales report: ' . $e->getMessage());
            return false;
        }
    }
}

