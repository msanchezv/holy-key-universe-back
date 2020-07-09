export class StatementsUtils{
    static getStatement(unitName: string, gender: string, card: string){
        const unitValue = gender ? `${gender} ${unitName}` : unitName;
        return STATEMENTS[card] ? STATEMENTS[card].replace('UNIT_VALUE', unitValue) : 'Completa el ejercicio: ';
    }
    static getFillStatement(){
        return 'Completa la frase: ';
    }
}

const STATEMENTS = {
    what: "¿Qué es UNIT_VALUE?",
    whatFor: "¿Para qué se usa UNIT_VALUE?",
    where: "¿Dónde surgio UNIT_VALUE?",
    how: "¿Cómo es UNIT_VALUE?",
    when: "¿Cuándo fue UNIT_VALUE?",
    why: "¿Por qué surgio UNIT_VALUE?",
    who: "¿Quién inventó UNIT_VALUE?"
}
