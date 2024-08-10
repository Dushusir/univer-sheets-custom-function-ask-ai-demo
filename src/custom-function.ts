import type {
    BaseReferenceObject,
    BaseValueObject,
    FunctionVariantType,
    IFunctionInfo,
    IFunctionNames
} from '@univerjs/engine-formula';
import {
    ArrayValueObject,
    AsyncObject,
    BaseFunction,
    ErrorType,
    ErrorValueObject,
    FunctionType,
    StringValueObject,
} from '@univerjs/engine-formula';
import { ErrorCode, IError } from '@univerjs/protocol'

import { type Ctor } from '@wendellhu/redi';

/**
 * function name
 */
export enum FUNCTION_NAMES_USER {
    ASK_AI = 'ASK_AI',
}

/**
 * i18n
 */
export const functionEnUS = {
    formula: {
        functionList: {
            ASK_AI: {
                description: 'Ask AI for data analysis.',
                abstract: 'Ask AI for data analysis',
                links: [
                    {
                        title: 'Instruction',
                        url: 'https://univer.ai',
                    },
                ],
                functionParameter: {
                    range: {
                        name: 'range',
                        detail: 'The data range to be analyzed.',
                    },
                    prompt: {
                        name: 'prompt',
                        detail: 'Enter what you want to ask the AI.'
                    }
                },
            },
        },
    },
};

export const functionZhCN = {
    formula: {
        functionList: {
            ASK_AI: {
                description: '咨询AI做数据分析。',
                abstract: '咨询AI做数据分析',
                links: [
                    {
                        title: 'Instruction',
                        url: 'https://univer.ai',
                    },
                ],
                functionParameter: {
                    range: {
                        name: '范围',
                        detail: '需要分析的数据范围。',
                    },
                    prompt: {
                        name: '提示词',
                        detail: '输入你要咨询AI的内容。'
                    }
                },
            },
        },
    },
};

/**
 * description
 */
export const FUNCTION_LIST_USER: IFunctionInfo[] = [
    {
        functionName: FUNCTION_NAMES_USER.ASK_AI,
        aliasFunctionName: 'formula.functionList.ASK_AI.aliasFunctionName',
        functionType: FunctionType.Univer,
        description: 'formula.functionList.ASK_AI.description',
        abstract: 'formula.functionList.ASK_AI.abstract',
        functionParameter: [
            {
                name: 'formula.functionList.ASK_AI.functionParameter.range.name',
                detail:
                    'formula.functionList.ASK_AI.functionParameter.range.detail',
                example: 'A1:B10',
                require: 1,
                repeat: 0,
            },
            {
                name: 'formula.functionList.ASK_AI.functionParameter.prompt.name',
                detail:
                    'formula.functionList.ASK_AI.functionParameter.prompt.detail',
                example: 'A1:B10',
                require: 0,
                repeat: 0,
            },
        ],
    },
];

/**
 * Get data asynchronously and assign it to array formula
 */
export class AskAI extends BaseFunction {

    override minParams = 1;

    override maxParams = 2;

    override needsReferenceObject = true;

    override calculate(range: FunctionVariantType, prompt?: FunctionVariantType) {
        if (range.isError()) {
            return range;
        }

        let unitId = '';
        let _range = range;

        if (range.isReferenceObject()) {
            unitId = (range as BaseReferenceObject).getUnitId();
            _range = (range as BaseReferenceObject).toArrayValueObject();
        }

        let _prompt = prompt ?? StringValueObject.create('Analyze the data');

        if (_prompt.isError()) {
            return _prompt;
        }

        if (_prompt.isReferenceObject()) {
            _prompt = (_prompt as BaseReferenceObject).toArrayValueObject();
        }

        return new AsyncObject(asyncArrayFunction(_range as BaseValueObject, unitId, _prompt as BaseValueObject));
    }

    override isAsync(): boolean {
        return true;
    }
}

async function asyncArrayFunction(range: BaseValueObject, unitId: string, prompt: BaseValueObject): Promise<ArrayValueObject> {

    const request = convertToAskFormulaRequest(range, unitId, prompt);

    const response = await mockRequest(request)

    const array = convertFromAskFormulaResponse(response);

    return ArrayValueObject.createByArray(array);
}

export const functionUser: Array<[Ctor<BaseFunction>, IFunctionNames]> = [
    [AskAI, FUNCTION_NAMES_USER.ASK_AI],
];


export interface AskFormulaRequest {
    /** the prompt for the model */
    unitId: string;
    rows: Row[];
}

export interface AskFormulaResponse {
    error:
    | IError // Error
    | undefined;
    /** the response from the model */
    content: string;
}
export interface RowCell {
    type: CellType;
    text: string;
    url: string;
}

export interface Row {
    cells: RowCell[];
}

export enum CellType {
    UNDEFINED = 0,
    TEXT = 1,
    URL = 2,
    IMAGE = 3,
    UNRECOGNIZED = -1,
}

function convertToAskFormulaRequest(range: BaseValueObject, unitId: string, prompt: BaseValueObject): AskFormulaRequest {

    const promptValueObject = prompt.isArray() ? (prompt as ArrayValueObject).getFirstCell() : prompt;
    const promptValue = promptValueObject.getValue().toString(); 

    if (range.isArray()) {

        const rows: Row[] = [];
        let currentRow: RowCell[] = [];
        let lastRowIndex = -1;

        (range as ArrayValueObject).iterator((value, rowIndex) => {
            const _value = value?.getValue().toString() || '';

            if (rowIndex !== lastRowIndex) {
                if (currentRow.length > 0) {
                    rows.push({ cells: currentRow });
                }
                currentRow = [];
                lastRowIndex = rowIndex;
            }

            currentRow.push({
                type: CellType.TEXT, // 假设所有单元格的 type 都为 TEXT
                text: _value,
                url: "" // 假设 url 都为空字符串
            });
        });

        if (currentRow.length > 0) {
            rows.push({ cells: currentRow });
        }

        return {
            unitId,
            rows: rows
        };
    }

    return {
        unitId,
        rows: [
            {
                cells: [
                    {
                        type: CellType.TEXT,
                        text: range.getValue().toString(),
                        url: '',
                    }
                ]
            }
        ]
    }

}

function convertFromAskFormulaResponse(response: AskFormulaResponse): string[][] {
    const {error, content} = response;
    const defaultMessage = 'Please try again'

    if(error?.code !== ErrorCode.OK){
        return [[defaultMessage]]
    }

    if(content){
        const array = JSON.parse(content) as string[][]
        return array;
    }

    return [[defaultMessage]]
}

async function mockRequest(request:AskFormulaRequest ): Promise<AskFormulaResponse>{
    return new Promise((resolve: (reponse: AskFormulaResponse) => void) => {
        setTimeout(() => {
            resolve({
                error: {
                    code: ErrorCode.OK,
                    message: ''
                },
                content: '[["Data","Title"],["1","2"]]'
                
            });
        }, 1000);
    });
}