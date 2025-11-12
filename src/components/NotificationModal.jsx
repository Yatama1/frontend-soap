import { motion, AnimatePresence } from "framer-motion";

export default function NotificationModal({ message, type = "success", show, onClose }) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 flex items-center justify-center z-[9999]"
                >
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className={`relative bg-gray-900 border ${type === "success" ? "border-green-600 text-green-500" : "border-red-600 text-red-500"
                            } px-8 py-5 rounded-2xl shadow-2xl text-center font-semibold`}
                    >
                        {message}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
