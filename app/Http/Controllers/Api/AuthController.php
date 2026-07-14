<?php

namespace App\Http\Controllers\Api;

use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use JWTAuth;
use App\Models\User;
use HasApiTokens;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    /**
     * Get a JWT for the given user and keep the expiry aligned with config.
     *
     * @return array<string, mixed>|null
     */
    private function issueToken(User $user)
    {
        try {
            $ttlMinutes = max(1, (int) config('jwt.ttl', 60));

            JWTAuth::factory()->setTTL($ttlMinutes);

            $token = JWTAuth::fromUser($user);

            return [
                'token' => $token,
                'expires_at' => now()->addMinutes($ttlMinutes),
            ];
        } catch (\Throwable $e) {
            return null;
        }
    }

    public function login(Request $request)
    {
        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['success' => false, "error" => true, 'email' => true, "message" => "The email doesn't match"]);
        }

        if($user->status == 2){
            return response()->json(['success' => false, "error" => true, 'data' => $user, "message" => "Your Account has been deleted."]);
        }
        if(Hash::check($request->password, $user->password)) { // The passwords match...
            $tokenData = $this->issueToken($user);

            if (!$tokenData) {
                return response()->json(['success' => false, 'message' => 'Token creation failed'], 500);
            }

            $user->token = $tokenData['token'];
            $user->token_expires_at = $tokenData['expires_at'];
            $user->save();

            if (!empty($user)) {
                $permissions = $user->getAllPermissions()->pluck('name');
            } else {
                $permissions = [];
            }

            return response()->json([
                "success" => true,
                "error" => false,
                'data' => $user,
                'token' => $tokenData['token'],
                'token_expires_at' => $tokenData['expires_at'],
                'message' => 'Login successfully!'
            ]);
        } else {
            return response()->json(["success" => false, "error" => true, "password" => true, "message" => "The password doesn't match"]);
        }
    }

    public function register(Request $request)
    { 
        try {
            $validated = Validator::make($request->all(), [
                'name' => ['required', 'string', 'max:255'],
                'email' => [
                    'required',
                    'string',
                    'email',
                    'max:255',
                    Rule::unique('users', 'email'), // use table name and column explicitly
                ],
                'password' => ['required', 'string', 'min:8'],
                'roles' => ['nullable'],
                'roles.*' => ['string', 'exists:roles,name'], // validate each role exists if provided
            ])->validate();

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
            ]);
    
            // Assign the role
            if (!empty($validated['roles'])) {
                $user->assignRole('User');
            }
           
            if ($user->save()){
                $tokenData = $this->issueToken($user);

                if (!$tokenData) {
                    return response()->json(['success' => false,'message'=>'Token generation failed'], 500);
                }

                $user->token = $tokenData['token'];
                $user->token_expires_at = $tokenData['expires_at'];
                $user->save();

                return response()->json([
                    'success' => true,
                    "error" => false,
                    'message' => 'You are register successfully!!!.',
                    'data' => $user,
                    'token' => $tokenData['token'],
                    'token_expires_at' => $tokenData['expires_at'],
                ], 200);        
            }else{
                return response()->json(['success' => false, "error" => false, 'message' => 'Something went worng, You cannot register!', 'data' => 'Can not register user'], 201);
            }
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    public function me()
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        return response()->json($user);
    }
    /**
     * Log the user out (Invalidate the token).
     *
     * @return \Illuminate\Http\JsonResponse
     */

    public function logout()
    {
        auth()->logout();

        return response()->json(['message' => 'Successfully logged out']);
    }

    /**
     * Refresh a token.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function refresh()
    {
        return $this->respondWithToken(auth()->refresh());
    }

    /**
     * Get the token array structure.
     *
     * @param  string $token
     *
     * @return \Illuminate\Http\JsonResponse
     */
    protected function respondWithToken($token)
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth()->factory()->getTTL() * 60
        ]);
    }
}