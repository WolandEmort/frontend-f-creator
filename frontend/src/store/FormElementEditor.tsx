import { useFormStore } from './formStore';
import { type FormElement } from '../types/form';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface FormElementEditorProps {
    element: FormElement;
}

type ValidationKey = keyof NonNullable<FormElement['validationRules']>;

export const FormElementEditor = ({ element }: FormElementEditorProps) => {
    const updateElement = useFormStore((state) => state.updateElement);
    const addOption = useFormStore((state) => state.addOption);
    const updateOption = useFormStore((state) => state.updateOption);
    const removeOption = useFormStore((state) => state.removeOption);

    const handleValidationChange = (key: ValidationKey, value: number | undefined) => {
        const currentRules = element.validationRules || {};
        const newRules = { ...currentRules, [key]: value };

        if (value === undefined || Number.isNaN(value)) {
            delete newRules[key];
        }

        updateElement(element.id, { validationRules: newRules });
    };

    // Блок для типу "Розрив сторінки"
    if (element.type === 'page_break') {
        return (
            <div className="flex flex-col gap-4 w-full pl-2 py-4">
                <div className="w-full text-center border-b-2 border-dashed border-gray-200 pb-2 mb-2">
                    <span className="text-gray-500 font-medium uppercase tracking-widest text-sm">
                        Розрив сторінки
                    </span>
                </div>
                <Input
                    value={element.title === 'Нове питання' ? '' : element.title} // Очищаємо дефолтний текст
                    onChange={(e) => updateElement(element.id, { title: e.target.value })}
                    placeholder="Заголовок нової сторінки (необов'язково)"
                    className="font-medium text-lg border-transparent hover:border-gray-200 focus:border-blue-500 shadow-none text-center"
                />
                <Input
                    value={element.description || ''}
                    onChange={(e) => updateElement(element.id, { description: e.target.value })}
                    placeholder="Опис нової сторінки (необов'язково)"
                    className="text-sm text-gray-500 text-center"
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 w-full pl-2 py-2">
            <Input
                value={element.title}
                onChange={(e) => updateElement(element.id, { title: e.target.value })}
                placeholder="Введіть питання"
                className="font-medium text-lg border-transparent hover:border-gray-200 focus:border-blue-500 shadow-none"
            />
            <Input
                value={element.description || ''}
                onChange={(e) => updateElement(element.id, { description: e.target.value })}
                placeholder="Опис або підказка (необов'язково)"
                className="text-sm text-gray-500"
            />

            {element.type === 'text' && (
                <div className="pl-2 w-1/2">
                    <Input disabled placeholder="Коротка відповідь" className="bg-gray-50 border-dashed text-gray-400 h-8" />
                </div>
            )}

            {element.type === 'textarea' && (
                <div className="pl-2 w-full">
                    <textarea
                        disabled
                        placeholder="Довга розгорнута відповідь"
                        className="w-full h-20 p-2 text-sm bg-gray-50 border border-gray-200 border-dashed rounded-md text-gray-400 resize-none outline-none"
                    />
                </div>
            )}

            {(element.type === 'radio' || element.type === 'checkbox') && element.options && (
                <div className="flex flex-col gap-3 pl-2">
                    {element.options.map((option, index) => (
                        <div key={option.id} className="flex items-center gap-3 group">
                            <span className="text-gray-400 text-lg leading-none pb-1">
                                {element.type === 'radio' ? '○' : '□'}
                            </span>

                            <Input
                                value={option.text}
                                onChange={(e) => updateOption(element.id, option.id, e.target.value)}
                                placeholder={`Варіант ${index + 1}`}
                                className="h-8 text-sm border-transparent hover:border-gray-200 focus:border-blue-500 shadow-none"
                            />

                            <button
                                type="button"
                                onClick={() => removeOption(element.id, option.id)}
                                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                ✕
                            </button>
                        </div>
                    ))}

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => addOption(element.id)}
                        className="w-max text-xs h-8 mt-1"
                    >
                        + Додати варіант
                    </Button>
                </div>
            )}

            <div className="mt-4 p-4 bg-gray-50 border border-gray-100 rounded-md flex flex-col gap-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer w-max">
                    <input
                        type="checkbox"
                        checked={element.required || false}
                        onChange={(e) => updateElement(element.id, { required: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    Обов'язкове питання
                </label>

                {(element.type === 'text' || element.type === 'textarea') && (
                    <div className="flex gap-6">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-500">Мін. довжина (символів)</label>
                            <Input
                                type="number"
                                min="0"
                                value={element.validationRules?.minLength ?? ''}
                                onChange={(e) => handleValidationChange('minLength', e.target.value !== '' ? parseInt(e.target.value, 10) : undefined)}
                                className="h-8 text-sm w-32"
                                placeholder="Не задано"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-500">Макс. довжина (символів)</label>
                            <Input
                                type="number"
                                min="0"
                                value={element.validationRules?.maxLength ?? ''}
                                onChange={(e) => handleValidationChange('maxLength', e.target.value !== '' ? parseInt(e.target.value, 10) : undefined)}
                                className="h-8 text-sm w-32"
                                placeholder="Не задано"
                            />
                        </div>
                    </div>
                )}

                {element.type === 'checkbox' && (
                    <div className="flex gap-6">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-500">Мінімум виборів</label>
                            <Input
                                type="number"
                                min="0"
                                value={element.validationRules?.minSelections ?? ''}
                                onChange={(e) => handleValidationChange('minSelections', e.target.value !== '' ? parseInt(e.target.value, 10) : undefined)}
                                className="h-8 text-sm w-32"
                                placeholder="Не задано"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-500">Максимум виборів</label>
                            <Input
                                type="number"
                                min="0"
                                value={element.validationRules?.maxSelections ?? ''}
                                onChange={(e) => handleValidationChange('maxSelections', e.target.value !== '' ? parseInt(e.target.value, 10) : undefined)}
                                className="h-8 text-sm w-32"
                                placeholder="Не задано"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};