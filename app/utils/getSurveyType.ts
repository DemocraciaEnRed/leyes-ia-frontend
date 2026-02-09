const surveyType = {
    basic: 'Base',
    custom: 'Personalizada',
} as const;

export default function getSurveyType(typeKey: keyof typeof surveyType): typeof surveyType[keyof typeof surveyType] {
    return surveyType[typeKey];
}