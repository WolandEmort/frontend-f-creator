import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "../ui/Button";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" }
    },
} as const;

export const LandingPage = () => {
    return (
        <div className="flex-grow flex flex-col items-center justify-center text-center px-6 py-20">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-3xl flex flex-col items-center"
            >
                <motion.h1
                    variants={itemVariants}
                    className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight text-gray-900 mb-6"
                >
                    Створюйте форми <br className="hidden lg:block" />
                    <span className="text-blue-600">нового покоління</span>
                </motion.h1>

                <motion.p
                    variants={itemVariants}
                    className="text-lg lg:text-xl text-gray-600 mb-10 max-w-2xl mx-auto"
                >
                    Потужний інструмент для збору даних. Гнучкий конструктор, складна валідація та миттєва аналітика результатів.
                </motion.p>

                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center w-full">
                    <Link to="/dashboard">
                        <Button size="lg" className="w-full sm:w-auto text-base">
                            Почати роботу
                        </Button>
                    </Link>
                    <Button size="lg" variant="secondary" className="w-full sm:w-auto text-base border border-gray-300">
                        Дізнатись більше
                    </Button>
                </motion.div>

                {/* Додатковий блок знизу для візуального балансу */}
                <motion.div
                    variants={itemVariants}
                    className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-8 text-sm font-medium text-gray-500 w-full max-w-2xl"
                >
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        Drag & Drop інтерфейс
                    </div>
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        Експорт у JSON / CSV
                    </div>
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        Складна валідація
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};