const { Given, When, Then } = require('@cucumber/cucumber');
const { expect, request } = require('@playwright/test');
const config = require('../playwright.config'); // Playwright config dosyasını içe aktarıyoruz
const jp = require('jsonpath'); // JSONPath ile JSON içinde kolayca gezinebilmek için

let apiRequest; // API isteklerini gerçekleştirecek Playwright nesnesi
let queryParams = {}; // Query parametrelerini tutacak JSON nesnesi
let response; // API yanıtını tutar
let fullURL = ''; // Tam URL için global değişken
let storedVariables = {}; // Değerleri depolamak için bir nesne

// Base URL'i Playwright config'ten çekiyoruz
Given('set base url {string}', async (baseUrl) => {
    const baseURL = baseUrl === 'baseURL' ? config.use.baseURL : baseUrl;
    console.log('Base URL from config:', baseURL); // Kontrol için log
    apiRequest = await request.newContext({ baseURL: baseURL });
    fullURL = baseURL;
});

Given('set url {string}', async (url) => {
    // Eğer URL bir stored değişkense, storedVariables'dan değeri alıyoruz
    if (url.startsWith('[') && url.endsWith(']')) {
        const variableName = url.slice(1, -1); // Köşeli parantezleri kaldırıyoruz
        url = storedVariables[variableName]; // Değeri storedVariables'dan alıyoruz
        if (!url) {
            throw new Error(`Stored variable '${variableName}' bulunamadı!`);
        }
    }

    // URL'yi baseURL ile birleştiriyoruz ve queryParams.url'ye atıyoruz
    fullURL = `${fullURL}/${url}`;
    queryParams.url = fullURL; // queryParams.url'yi güncelliyoruz
    console.log('Final Full URL:', fullURL); // Tam URL'yi yazdırıyoruz
});

Given('add query param {string} = {string}', async (key, value) => {
    // Eğer value bir stored değişkense (ör. "[username]")
    if (value.startsWith('[') && value.endsWith(']')) {
        const variableName = value.slice(1, -1); // Köşeli parantezleri kaldırıyoruz
        value = storedVariables[variableName]; // storedVariables'dan değeri alıyoruz
        if (!value) {
            throw new Error(`Stored variable '${variableName}' bulunamadı!`);
        }
    }

    // Query parametrelerini oluşturmak için
    const separator = fullURL.includes('?') ? '&' : '?'; // URL'de halihazırda '?' varsa '&' eklenir
    fullURL = `${fullURL}${separator}${key}=${value}`; // Query parametrelerini fullURL'ye ekliyoruz
    console.log(`Updated Full URL with Query Params: ${fullURL}`); // Tam URL'yi yazdırıyoruz
});




// Query parametrelerini ekliyoruz
Given('set body {string} = {string}', async (key, value) => {
    if (key.includes('[') || key.includes('.')) {
        // Nested JSON veya diziler için
        const keys = key.replace(/\[(\d+)\]/g, '.$1').split('.');
        let tempObj = queryParams;
        for (let i = 0; i < keys.length - 1; i++) {
            tempObj[keys[i]] = tempObj[keys[i]] || (isNaN(keys[i + 1]) ? {} : []);
            tempObj = tempObj[keys[i]];
        }
        tempObj[keys[keys.length - 1]] = isNaN(value) ? value : parseInt(value);
    } else {
        queryParams[key] = isNaN(value) ? value : parseInt(value);
    }
});

// Dinamik olarak istek gönderiyoruz
When('make {string} request', async (method) => {
    console.log('Request URL:', fullURL); // fullURL'yi kontrol edin
    const body = { ...queryParams }; // Query parametrelerini body olarak kullanıyoruz
    delete body.url; // URL'yi body'den çıkarıyoruz

    // HTTP metoduna göre istek gönderiyoruz
    switch (method.toUpperCase()) {
        case 'POST':
            response = await apiRequest.post(fullURL, { data: body });
            break;
        case 'GET':
            response = await apiRequest.get(fullURL);
            break;
        case 'PUT':
            response = await apiRequest.put(fullURL, { data: body });
            break;
        case 'DELETE':
            response = await apiRequest.delete(fullURL);
            break;
        default:
            throw new Error(`Unsupported HTTP method: ${method}`);
    }
});

// Yanıt durum kodunu kontrol ediyoruz
Then('check status code = {string}', async (statusCode) => {
    console.log('Raw Response:', await response.text()); // Yanıtın ham metnini kontrol edin
    expect(response.status()).toBe(parseInt(statusCode));
});

// Yanıt gövdesindeki belirli bir alanı kontrol ediyoruz
Then('check response {string} = {string}', async (field, value) => {
    const responseBody = await response.json();
    console.log('Response Body:', JSON.stringify(responseBody, null, 2)); // Yanıt gövdesini konsola yazdırır
  
    // Eğer value bir stored variable ise (ör. "[petID]")
    if (value.startsWith('[') && value.endsWith(']')) {
      const variableName = value.slice(1, -1); // Köşeli parantezleri kaldırıyoruz
      value = storedVariables[variableName]; // storedVariables'dan değeri alıyoruz
      if (!value) {
        throw new Error(`Stored variable '${variableName}' bulunamadı!`);
      }
    }
  
    console.log(`Checking if response field "${field}" equals "${value}"`);
    expect(responseBody[field]).toBe(value); // Yanıt gövdesindeki alanı kontrol ediyoruz
  });
  

// Yanıt gövdesinden değer depoluyoruz
Then('store {string} = {string}', async (variableName, jsonPath) => {
    const responseBody = await response.json();
    console.log('Response Body for Storing:', JSON.stringify(responseBody, null, 2)); // Yanıtın gövdesini yazdırır

    // JSONPath ile değeri bulup depoluyoruz
    const value = jp.value(responseBody, `$..${jsonPath}`); // JSONPath kütüphanesi ile değer al
    console.log(`Storing ${variableName} = ${value}`); // Depolanan değeri yazdır
    storedVariables[variableName] = value; // Değeri kaydet
});


// Depolanan değeri kontrol ediyoruz
Then('check stored value {string} = {int}', async (variableName, expectedValue) => {
    console.log(`Checking stored variable: ${variableName}`);
    const storedValue = storedVariables[variableName];
    expect(storedValue).toBe(expectedValue);
});
