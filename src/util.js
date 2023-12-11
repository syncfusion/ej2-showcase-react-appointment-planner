import { FormValidator } from '@syncfusion/ej2-react-inputs';
import { createElement, remove, removeClass } from '@syncfusion/ej2-base';
import adminImage from './assets/images/Admin.png';
import alexImage from './assets/images/AlexaRichardson.png';
import ameliaImage from './assets/images/AmeliaEdwards.png';
import defaultImage from './assets/images/default.png';
import mollieImage from './assets/images/MollieCobb.png';
import nemboImage from './assets/images/NemboLukni.png';
import noutImage from './assets/images/NoutGolstein.png';
import paulImage from './assets/images/PaulWalker.png';
import yaraImage from './assets/images/YaraBarros.png';
export function renderFormValidator(formElement, rules, parentElement) {
    const model = {
        customPlacement: (inputElement, error) => { errorPlacement(inputElement, error); },
        rules: rules,
        validationComplete: (args) => {
            validationComplete(args, parentElement);
        }
    };
    const obj = new FormValidator(formElement, model);
}
function validationComplete(args, parentElement) {
    const elem = parentElement.querySelector('#' + args['inputName'] + '_Error');
    if (elem) {
        elem.style.display = (args['status'] === 'failure') ? '' : 'none';
    }
}
export function errorPlacement(inputElement, error) {
    const id = error.getAttribute('for');
    const elem = inputElement.parentElement.querySelector('#' + id + '_Error');
    if (!elem) {
        const div = createElement('div', {
            className: 'field-error',
            id: inputElement.getAttribute('name') + '_Error'
        });
        const content = createElement('div', { className: 'error-content' });
        content.appendChild(error);
        div.appendChild(content);
        inputElement.parentElement.parentElement.appendChild(div);
    }
}
export function destroyErrorElement(formElement, inputElements) {
    if (formElement) {
        const elements = [].slice.call(formElement.querySelectorAll('.field-error'));
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
export function updateActiveItem(text) {
    const elements = document.querySelectorAll('.active-item');
    elements.forEach(element => {
        if (element.classList.contains('active-item')) {
            element.classList.remove('active-item');
        }
    });
    document.querySelector('.sidebar-item.' + text).classList.add('active-item');
}
export function getEventTime(data, instance) {
    return (getString(new Date(data['StartTime']), 'MMMd', instance) + ',' + getString(new Date(data['StartTime']), 'hm', instance) +
        '-' + getString(new Date(data['EndTime']), 'hm', instance));
}
export function getString(value, type, instance) {
    return instance.formatDate(new Date(value), { type: 'dateTime', skeleton: type });
}
export function getDepartmentName(id, specialistCategory) {
    return specialistCategory.filter(item => id === item['DepartmentId'])[0]['Text'].toUpperCase();
}
export function getTreatmentDetail(data) {
    return data['Treatment'] || 'CHECKUP';
}
export function loadImage(imageName) {
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
