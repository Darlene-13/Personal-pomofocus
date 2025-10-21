import { useState } from "react";
import { useLocation } from "wouter";
import { setAuthToken, publicRequest } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogIn, UserPlus } from "lucide-react";

export default function Login() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();

    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        name: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
            const payload = isLogin
                ? { email: formData.email, password: formData.password }
                : formData;

            const response = await publicRequest("POST", endpoint, payload);

            if (response.token) {
                setAuthToken(response.token);
                toast({
                    title: "Success!",
                    description: isLogin ? "Welcome back!" : "Account created successfully!",
                });
                setLocation("/");
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Something went wrong",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

            <Card className="w-full max-w-md p-8 space-y-6 shadow-2xl relative overflow-hidden bg-card text-card-foreground">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-pink-400 to-purple-500 rounded-full filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative z-10">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                            Focus Flow
                        </h1>
                        <p className="text-muted-foreground">
                            {isLogin ? "Welcome back! Sign in to continue" : "Create your account to get started"}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-medium mb-2 text-foreground">Name</label>
                                <input
                                    type="text"
                                    required={!isLogin}
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    placeholder="Your name"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-2 text-foreground">Email</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-foreground">Password</label>
                            <input
                                type="password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                placeholder="••••••••"
                                minLength={6}
                            />
                            {!isLogin && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    Must be at least 6 characters
                                </p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-6 text-lg font-semibold transition-all transform hover:scale-105"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    {isLogin ? "Signing in..." : "Creating account..."}
                                </>
                            ) : (
                                <>
                                    {isLogin ? (
                                        <>
                                            <LogIn className="w-5 h-5 mr-2" />
                                            Sign In
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="w-5 h-5 mr-2" />
                                            Sign Up
                                        </>
                                    )}
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
                        >
                            {isLogin
                                ? "Don't have an account? Sign up"
                                : "Already have an account? Sign in"}
                        </button>
                    </div>

                    <div className="mt-8 pt-6 border-t border-border">
                        <p className="text-xs text-center text-muted-foreground">
                            By continuing, you agree to Focus Flow's Terms of Service and Privacy Policy
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}