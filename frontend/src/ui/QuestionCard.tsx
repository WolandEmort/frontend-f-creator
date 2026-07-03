import { Card } from "../ui/Card";
import { Input } from "../ui/Input";


interface QuestionCardProps {
    type: "text" | "single_choice" | "multiple_choice";
    title: string;
}

export const QuestionCard = ({ type, title }: QuestionCardProps) => {
    const renderQuestionInput = () => {
        switch (type) {
            case "text":
                return <Input placeholder="Текст короткої відповіді" disabled />;
            case "single_choice":
                return <div className="text-sm text-gray-500">🔘 Варіант 1 (Радіокнопки)</div>;
            case "multiple_choice":
                return <div className="text-sm text-gray-500">☑️ Варіант 1 (Чекбокси)</div>;
            default:
                return null;
        }
    };

    return (
        <Card className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
                <Input
                    value={title}
                    className="text-lg font-semibold border-transparent hover:border-gray-300 focus-visible:border-gray-300 bg-gray-50"
                    readOnly
                />
            </div>
            <div className="mt-2">
                {renderQuestionInput()}
            </div>
        </Card>
    );
};