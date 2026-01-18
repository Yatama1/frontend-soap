import { useState } from "react";
import {
    Settings,
    Shield,
    Palette,
    Globe,
    Save,
    Server,
} from "lucide-react";

export default function SettingsSystem() {
    const [general, setGeneral] = useState({
        appName: "GudangApp",
        systemEmail: "admin@gudangapp.com",
    });

    const [preferences, setPreferences] = useState({
        theme: "light",
        language: "id",
    });

    const [security, setSecurity] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handleSaveGeneral = () => {
        alert("Pengaturan umum disimpan (dummy).");
    };

    const handleSavePreferences = () => {
        alert("Preferensi sistem disimpan (dummy).");
    };

    const handleChangePassword = () => {
        if (!security.newPassword || security.newPassword !== security.confirmPassword) {
            alert("Password baru tidak cocok.");
            return;
        }
        alert("Password berhasil diperbarui (dummy).");
    };

    return (
        <div className="max-w-7xl mx-auto min-h-screen bg-gray-50/30 font-sans">

            {/* HEADER */}
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Settings className="text-blue-600" />
                    Pengaturan Sistem
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                    Kelola konfigurasi aplikasi dan keamanan sistem.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ================= LEFT ================= */}
                <div className="lg:col-span-2 space-y-6">

                    {/* GENERAL SETTINGS */}
                    <Card
                        title="Pengaturan Umum"
                        icon={<Server size={18} />}
                    >
                        <div className="space-y-4">
                            <Field label="Nama Aplikasi">
                                <input
                                    type="text"
                                    value={general.appName}
                                    onChange={(e) =>
                                        setGeneral({ ...general, appName: e.target.value })
                                    }
                                    className="input"
                                />
                            </Field>

                            <Field label="Email Sistem">
                                <input
                                    type="email"
                                    value={general.systemEmail}
                                    onChange={(e) =>
                                        setGeneral({ ...general, systemEmail: e.target.value })
                                    }
                                    className="input"
                                />
                            </Field>

                            <div className="flex justify-end">
                                <button
                                    onClick={handleSaveGeneral}
                                    className="btn-primary"
                                >
                                    <Save size={16} /> Simpan
                                </button>
                            </div>
                        </div>
                    </Card>

                    {/* PREFERENCES */}
                    <Card
                        title="Preferensi Sistem"
                        icon={<Palette size={18} />}
                    >
                        <div className="space-y-4">
                            <Field label="Tema">
                                <select
                                    value={preferences.theme}
                                    onChange={(e) =>
                                        setPreferences({ ...preferences, theme: e.target.value })
                                    }
                                    className="input"
                                >
                                    <option value="light">Light</option>
                                    <option value="dark">Dark</option>
                                    <option value="system">System</option>
                                </select>
                            </Field>

                            <Field label="Bahasa">
                                <select
                                    value={preferences.language}
                                    onChange={(e) =>
                                        setPreferences({ ...preferences, language: e.target.value })
                                    }
                                    className="input"
                                >
                                    <option value="id">Indonesia</option>
                                    <option value="en">English</option>
                                </select>
                            </Field>

                            <div className="flex justify-end">
                                <button
                                    onClick={handleSavePreferences}
                                    className="btn-primary"
                                >
                                    <Save size={16} /> Simpan
                                </button>
                            </div>
                        </div>
                    </Card>

                    {/* SECURITY */}
                    <Card
                        title="Keamanan"
                        icon={<Shield size={18} />}
                    >
                        <div className="space-y-4">
                            <Field label="Password Lama">
                                <input
                                    type="password"
                                    className="input"
                                    value={security.currentPassword}
                                    onChange={(e) =>
                                        setSecurity({ ...security, currentPassword: e.target.value })
                                    }
                                />
                            </Field>

                            <Field label="Password Baru">
                                <input
                                    type="password"
                                    className="input"
                                    value={security.newPassword}
                                    onChange={(e) =>
                                        setSecurity({ ...security, newPassword: e.target.value })
                                    }
                                />
                            </Field>

                            <Field label="Konfirmasi Password Baru">
                                <input
                                    type="password"
                                    className="input"
                                    value={security.confirmPassword}
                                    onChange={(e) =>
                                        setSecurity({ ...security, confirmPassword: e.target.value })
                                    }
                                />
                            </Field>

                            <div className="flex justify-end">
                                <button
                                    onClick={handleChangePassword}
                                    className="btn-primary"
                                >
                                    <Save size={16} /> Ubah Password
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* ================= RIGHT ================= */}
                <div className="space-y-6">

                    {/* SYSTEM INFO */}
                    <Card
                        title="Informasi Sistem"
                        icon={<Globe size={18} />}
                    >
                        <ul className="space-y-3 text-sm text-gray-600">
                            <li className="flex justify-between">
                                <span>Versi Aplikasi</span>
                                <span className="font-medium text-gray-800">v1.0.0</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Status Server</span>
                                <span className="text-green-600 font-semibold">Online</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Lingkungan</span>
                                <span className="font-medium">Production</span>
                            </li>
                        </ul>
                    </Card>
                </div>
            </div>
        </div>
    );
}

/* ================= COMPONENTS ================= */

function Card({ title, icon, children }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-5 text-gray-800 font-semibold">
                <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    {icon}
                </span>
                {title}
            </div>
            {children}
        </div>
    );
}

function Field({ label, children }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
                {label}
            </label>
            {children}
        </div>
    );
}
