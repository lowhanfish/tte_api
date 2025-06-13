# tte_api

API to integrate Electronic Signatures with the eSign system owned by the local government of South Konawe Regency

### Test on Node Ver > 18.19.0

###### POST Parameters (Raw) :

1. judul: "Title of the letter"
2. nomor: "Number of the letter to be signed"
3. passphrase: "Passphrase of the electronic signature owner/signer user"
4. nik: "National Identity Number (NIK) of the signer"
5. tagTTDX: "Tag to be replaced with the electronic signature logo/QR code"
6. TOKEN: "Token obtained from the Department of Communication, Informatics, and Cryptography of South Konawe Regency"
7. filebase64: "Base64 of the PDF file to be signed"
