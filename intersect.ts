const array1 = [{
    "bankBik": "042809679",
    "bankCorrespondentAccount": "30101810700000000679",
    "bankId": "BANK_042809679",
    "bankName": "ТВЕРСКОЕ ОТДЕЛЕНИЕ N8607 ПАО СБЕРБАНК",
    "bankSwift": undefined,
    "bankType": "other",
    "clientAccount": "40817810563001293884",
    "correspondentAccount": undefined,
    "correspondentBankId": undefined,
    "correspondentBankName": undefined,
    "correspondentBankSwift": undefined,
    "currency": "RUB",
    "displayName": "DAы",
    "id": "1eca504c-cd04-6530-bae0-06e2c49e5d03",
    "latFio": undefined,
    "processingRequisite": undefined
}, {
    "bankBik": "042809679",
    "bankCorrespondentAccount": "30101810700000000679",
    "bankId": "BANK_042809679",
    "bankName": "ТВЕРСКОЕ ОТДЕЛЕНИЕ N8607 ПАО СБЕРБАНК",
    "bankSwift": undefined,
    "bankType": "other",
    "clientAccount": "40817810563001293884",
    "correspondentAccount": undefined,
    "correspondentBankId": undefined,
    "correspondentBankName": undefined,
    "correspondentBankSwift": undefined,
    "currency": "RUB",
    "displayName": "DAы",
    "id": "1eca504c-cd04-6530-bae0-06e2c49e5d04",
    "latFio": undefined,
    "processingRequisite": undefined
}]

const array2 = [{
    "active": true,
    "bankBik": "042809679",
    "bankId": "BANK_042809679",
    "bankName": "ТВЕРСКОЕ ОТДЕЛЕНИЕ N8607 ПАО СБЕРБАНК",
    "bankSwift": undefined,
    "clientAccount": "40817810563001293884",
    "correspondentAccount": undefined,
    "correspondentBankId": undefined,
    "correspondentBankName": undefined,
    "correspondentBankSwift": undefined,
    "currency": "RUB",
    "displayName": "DAы",
    "error": undefined,
    "id": "1eca504c-cd04-6530-bae0-06e2c49e5d03",
    "latFio": undefined,
    "requestId": 1647420057630
}]

function filterProcessingIds(arr1, arr2) {
    const processingIds = arr2.map(req => req.id);

    return arr1.filter(req => !processingIds.includes(req.id));
}

console.info(filterProcessingIds(array1, array2))