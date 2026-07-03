export type QuestionType = 'text' | 'textarea' | 'radio' | 'checkbox' | 'page_break';

export interface ValidationRules {
    minLength?: number;
    maxLength?: number;
    pattern?: string;        // Для регулярних виразів
    minSelections?: number;  // Для чекбоксів
    maxSelections?: number;  // Для чекбоксів
}

export interface FormElement {
    id: string; // Унікальний ідентифікатор конкретного блоку в робочій області
    type: QuestionType; // Тип питання
    title: string; // Текст питання
    description?: string; // Підказка до питання (опціонально)
    required: boolean; // Валідація: чи є поле обов'язковим
    options?: FormElementOption[];
    validationRules?: ValidationRules;
}

export interface Form {
    id?: string;
    title: string;
    description: string;
    elements: FormElement[];
}

export interface FormElementOption {
    id: string;
    text: string;
}