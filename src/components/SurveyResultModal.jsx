import { useState } from "react";

export default function SurveyResultModal({
    open,
    onClose,
    onSubmit,
    survey,
}) {
    const [form, setForm] = useState({
        hasil_survey: "",
        catatan: "",
        follow_up: "",
    });

    if (!open) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(form);
    };

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
                <h3 className="text-lg font-bold text-slate-800 mb-4">
                    Hasil Survey
                </h3>

                <p className="text-sm text-slate-500 mb-4">
                    Buyer: <b>{survey?.Cabuy?.nama_cabuy}</b> <br />
                    Rumah: <b>Tipe {survey?.Rumah?.tipe}</b>
                </p>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="text-sm font-medium">Hasil Survey</label>
                        <select
                            className="w-full border rounded-lg p-2"
                            value={form.hasil_survey}
                            onChange={(e) =>
                                setForm({ ...form, hasil_survey: e.target.value })
                            }
                            required
                        >
                            <option value="">-- Pilih Hasil --</option>
                            <option value="Tertarik">Tertarik</option>
                            <option value="Ragu">Ragu</option>
                            <option value="Tidak Tertarik">Tidak Tertarik</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-medium">Catatan</label>
                        <textarea
                            className="w-full border rounded-lg p-2"
                            rows="3"
                            value={form.catatan}
                            onChange={(e) =>
                                setForm({ ...form, catatan: e.target.value })
                            }
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Rencana Follow Up</label>
                        <input
                            className="w-full border rounded-lg p-2"
                            value={form.follow_up}
                            onChange={(e) =>
                                setForm({ ...form, follow_up: e.target.value })
                            }
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded-lg"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Kirim
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
