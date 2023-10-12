import { FormValidator, FormValidatorModel } from '@syncfusion/ej2-react-inputs';
import { createElement, remove, removeClass, Internationalization } from '@syncfusion/ej2-base';
import adminImage from './assets/images/Admin.png';
import alexImage from './assets/images/AlexaRichardson.png';
import ameliaImage from './assets/images/AmeliaEdwards.png';
import defaultImage from './assets/images/default.png';
import mollieImage from './assets/images/MollieCobb.png';
import nemboImage from './assets/images/NemboLukni.png';
import noutImage from './assets/images/NoutGolstein.png';
import paulImage from './assets/images/PaulWalker.png';
import yaraImage from './assets/images/YaraBarros.png';

export function renderFormValidator(formElement: HTMLFormElement, rules: Record<string, any>, parentElement: HTMLElement): void {
    const model: FormValidatorModel = {
        customPlacement: (inputElement: HTMLElement, error: HTMLElement) => { errorPlacement(inputElement, error); },
        rules: rules as { [name: string]: { [rule: string]: Record<string, any> } },
        validationComplete: (args: Record<string, any>) => {
            validationComplete(args, parentElement);
        }
    };
    const obj: FormValidator = new FormValidator(formElement, model);
}

function validationComplete(args: Record<string, any>, parentElement: HTMLElement): void {
    const elem: HTMLElement = parentElement.querySelector('#' + args['inputName'] + '_Error') as HTMLElement;
    if (elem) {
        elem.style.display = (args['status'] === 'failure') ? '' : 'none';
    }
}

export function errorPlacement(inputElement: HTMLElement, error: HTMLElement): void {
    const id: string = error.getAttribute('for');
    const elem: Element = inputElement.parentElement.querySelector('#' + id + '_Error');
    if (!elem) {
        const div: HTMLElement = createElement('div', {
            className: 'field-error',
            id: inputElement.getAttribute('name') + '_Error'
        });
        const content: Element = createElement('div', { className: 'error-content' });
        content.appendChild(error);
        div.appendChild(content);
        inputElement.parentElement.parentElement.appendChild(div);
    }
}

export function destroyErrorElement(formElement: HTMLFormElement, inputElements: HTMLInputElement[]): void {
    if (formElement) {
        const elements: Element[] = [].slice.call(formElement.querySelectorAll('.field-error'));
        for (const elem of elements) {
            remove(elem);
        }
        for (const element of inputElements) {
            if (element.querySelector('input').classList.contains('e-error')) {
                removeClass([element.querySelector('input')], 'e-error');
            }
        }
    }
}

export function updateActiveItem(text: string): void {
    const elements: NodeListOf<Element> = document.querySelectorAll('.active-item');
    elements.forEach(element => {
        if (element.classList.contains('active-item')) {
            element.classList.remove('active-item');
        }
    });
    document.querySelector('.sidebar-item.' + text).classList.add('active-item');
}

export function getEventTime(data: Record<string, any>, instance: Internationalization): string {
    return (getString(new Date(data['StartTime']), 'MMMd', instance) + ',' + getString(new Date(data['StartTime']), 'hm', instance) +
        '-' + getString(new Date(data['EndTime']), 'hm', instance));
}

export function getString(value: Date, type: string, instance: Internationalization): string {
    return instance.formatDate(new Date(value), { type: 'dateTime', skeleton: type });
}

export function getDepartmentName(id: number, specialistCategory: Record<string, any>[]): string {
    return (specialistCategory.filter(item => id === item['DepartmentId'])[0]['Text'] as string).toUpperCase();
}

export function getTreatmentDetail(data: Record<string, any>): string {
    return data['Treatment'] || 'CHECKUP';
}

export function loadImage(imageName: string) {
    switch (imageName) {
        case 'Admin':
            {
                return adminImage;
            }
        case 'AlexaRichardson':
            {
                return alexImage;
            }
        case 'AmeliaEdwards':
            {
                return ameliaImage;
            }
        case 'MollieCobb':
            {
                return mollieImage;
            }
        case 'NemboLukni':
            {
                return nemboImage;
            }
        case 'NoutGolstein':
            {
                return noutImage;
            }
        case 'PaulWalker':
            {
                return paulImage;
            }
        case 'YaraBarros':
            {
                return yaraImage;
            }
        default:
            {
                return defaultImage;
            }
    }
}