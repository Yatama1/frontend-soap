import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function LoginMember() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [jabatan, setJabatan] = useState("member"); // default member
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const res = await api.post("/auth/login-member", {
                email,
                password,
                jabatan,
            });

            // Simpan token dan user ke localStorage
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));

            const role = res.data.user.role.toLowerCase();
            if (role === "leader") navigate("/leader/dashboard");
            else if (role === "senior leader") navigate("/senior/dashboard");
            else navigate("/member/dashboard");
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Login gagal");
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-700">
                    Login Member
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email */}
                    <div>
                        <label className="block text-gray-600 mb-1">Email</label>
                        <input
                            type="email"
                            placeholder="Masukkan email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                            required
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-gray-600 mb-1">Password</label>
                        <input
                            type="password"
                            placeholder="Masukkan password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                            required
                        />
                    </div>

                    {/* Role/Jabatan */}
                    <div>
                        <label className="block text-gray-600 mb-1">Jabatan</label>
                        <select
                            value={jabatan}
                            onChange={(e) => setJabatan(e.target.value)}
                            className="w-full border px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                        >
                            <option value="senior leader">Senior Leader</option>
                            <option value="leader">Leader</option>
                            <option value="member">Member</option>
                        </select>
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="text-center text-red-500 text-sm">{error}</p>
                    )}

                    {/* Tombol Login */}
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}
