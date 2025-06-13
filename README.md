# tte_api

API to integrate Electronic Signatures with the eSign system owned by the local government of South Konawe Regency

### Test on Node Ver > 18.19.0

###### POST Parameters (Raw) :

. judul: "Title of the letter"
. nomor: "Number of the letter to be signed"
. passphrase: "Passphrase of the electronic signature owner/signer user"
. nik: "National Identity Number (NIK) of the signer"
. tagTTDX: "Tag to be replaced with the electronic signature logo/QR code"
. TOKEN: "Token obtained from the Department of Communication, Informatics, and Cryptography of South Konawe Regency"
. filebase64: "Base64 of the PDF file to be signed"
