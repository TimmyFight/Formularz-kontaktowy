const form = document.querySelector('#contactForm');
const inputs = document.querySelectorAll('input[required], textarea[required], select[required]');

//wyłączam domyślną walidację
form.setAttribute('novalidate', true);

const displayFieldError = function(elem) {
    const fieldRow = elemm.closest('.form-row');
    const fieldError = fieldRow.querySelector('.field-error');
    //jeżeli komunikat z błędem pod polem nie istnieje
    if(fieldError === null) {
        //pobieramy z pola tekst błędu i tworzymy pole
        const errorText = elem.dataset.error;
        const divError = document.createElement('div');
        divError.classList.add('field-error');
        divError.innerText = errorText;
        fieldRow.appendChild(divError);
    }
};

const hideFieldErrror = function(elem) {
    const fieldRow = elem.closest('.form-row');
    const fieldError = fieldRow.querySelector('.field-error');
    //jeżeli pobrane pole istnieje usuń je
    if (fieldError !== null) {
        fieldError.remove();
    }
};

//zamieniam inputs na na tablicę i robimy po niej pętlę
[...inputs].forEach(elem => {
    elem.addEventListener('input', function() {
        if (!this.checkValidity()) {
            this.classList.add('error');
        } else {
            this.classList.add('error');
            hideFieldErrror(this);
            } 
        });

        if (elem.type === "checkbox") {
            elem.addEventListener('click', function(){
                const formRow = this.closest('form-row');
                if (this.checked) { 
                    this.classList.remove('error');
                    hideFieldErrror(this);
                } else {
                    this.classList.add('error');
                }
            });
        }     
});

const checkFieldErrors = function(elements) {
    //ustawiamy zmienną na true. Natępnie robimy pętle po wszystkich polach jeżeli któreś z pól jest błędne, przełączamy zmienną na false
    let fieldAreValid = true;

    [...elements].forEach(elem => {
        if (elem.checkValidity()) {
            hideFieldError(elem);
            elem.classList.remove('error');
            fieldAreValid = false;
        }
    });
    return fieldsAreValid;
};

form.addEventListener('submit', e => {

    //jeżeli wszystkie pola są poprawne...
    if (checkFieldErrors(inputs)) {
        //generujemy dane jako obiekt dataToSend domyslnie elementy disabled nie są wysyłane! 
        const elements = form.querySelectorAll('input:not(:disabled), textarea:not(:disabled), select:not(:disabled)');

        const dataToSend = new FormData();
        [...elemnts].forEach(el => dataToSend.append(el.name, el.value));

        const submit = form.querySelector('[type="submit"]');
        submit.disabled = true;
        submit.classList.add('element-is-busy');

        const url = form.getAttribute('action');
        const method = form.getAttribute('method');

        fetch(url, {
            method: method.toLocaleUpperCase(),
            body: dataToSend
        })
        .then(ret => ret.json())
        .then(ret => {
            submit.disabled = false;
            submit.classList.remove('element-is-busy');

            if (ret.errors) {
                ret.errors.map(function(el) {
                    return '[name="'+el+'"]'
                });

                const badFields = form.querySelectorAll(ret.errors.join(','));
                checkFieldsErrors(badFields);
            }else {
                if (ret.status === 'ok') {
                    const div = document.createElement('div');
                    div.classList.add('form-send-success');
                    div.innerText = 'Wysyłanie wiadomości się nie powiodło';

                    form.parentElement.insertBefore(div, form);
                    div.innerHTML = '<strong>Wiadomość został wysłana</strong> <span>Dzękujemy za kontakt. Skontaktujemy się z Tobą jak najszybciej</span>';
                    form.remove();
                }
                if (ret.status === 'error') {
                    //jazeli istnieje komunikat o błędzie wysyłki usuwamy go, by go nie duplikować
                    if (document.querySelector('.send-error')) {
                        document.querySelector('.send-error').remove();
                    }
                    const div = document.createElement('div');
                    div.classList.add('send-error');
                    div.innerText = 'Wysyłanie wiadomości się nie powiodło';
                    submit.parentElement.appendChild(div);
                }
            }

        }).catch(_=> {
            submit.disabled = false;
            submit.classList.remove('element-is-busy');
        });

    }
});
