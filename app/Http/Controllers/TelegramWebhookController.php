<?php

namespace App\Http\Controllers;

use App\Services\TelegramService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TelegramWebhookController extends Controller
{
    public function handle(Request $request, TelegramService $telegramService)
    {
        Log::info('Telegram Webhook Received', $request->all());

        $botType = $request->query('bot', 'payment');
        $chatId = $request->input('message.chat.id');
        $text = trim($request->input('message.text') ?? '');

        if (!$chatId) {
            return response()->json(['status' => 'no_chat_id']);
        }

        // Check if message is a registration command
        if (str_starts_with($text, '/start') || str_starts_with($text, '/register')) {
            // Save the Chat ID for the specific bot type
            $telegramService->saveChatId((string)$chatId, $botType);

            // Send confirmation message back to Telegram
            $reply = "✅ <b>Telegram Chat Registered!</b>\n\n";
            if ($botType === 'receiver') {
                $reply .= "New order notifications for <b>" . e(config('app.name', 'Tos Sak')) . "</b> will now be sent to this chat.";
            } elseif ($botType === 'report') {
                $reply .= "Daily sale reports for <b>" . e(config('app.name', 'Tos Sak')) . "</b> will now be sent to this chat.";
            } elseif ($botType === 'low_stock') {
                $reply .= "Low stock alerts for <b>" . e(config('app.name', 'Tos Sak')) . "</b> will now be sent to this chat.";
            } else {
                $reply .= "Payment alerts for <b>" . e(config('app.name', 'Tos Sak')) . "</b> will now be sent to this chat.";
            }
            
            $telegramService->sendTextMessage((string)$chatId, $reply, $botType);

            return response()->json(['status' => 'registered', 'chat_id' => $chatId, 'bot' => $botType]);
        }

        return response()->json(['status' => 'ignored']);
    }
}
