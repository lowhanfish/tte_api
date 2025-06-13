const express = require('express');

const uniqid = require('uniqid');
const fetch = require('node-fetch');
const fs = require('fs');
const { createWriteStream } = require('fs');
const { pipeline } = require('stream');
const { promisify } = require('util');
const FormData = require('form-data');
const path = require('path');


require('dotenv').config(); // ← aktifkan dotenv



const app = express();
const port = 3000;

// Middleware (opsional)
app.use(express.json({ limit: '10mb' })); // agar bisa menerima base64 besar


app.use('/publish', express.static(
  path.join(__dirname, './publish'),
  {
    setHeaders: function setHeaders(res, path, stat) {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET');
      res.header('Access-Control-Allow-Headers', 'Content-Type');
    }
  }


))


var URL_SERVER = process.env.URL_SERVER
var URL_TTEX = process.env.URL_TTEX

var Username = process.env.Usernamex
var Password = process.env.Passwordx
var TOKEN = process.env.TOKEN


console.log("URL_SERVER", URL_SERVER);
console.log("URL_TTEX", URL_TTEX);
console.log("Username", Username);
console.log("Password", Password);
console.log("TOKEN", TOKEN);



// app.use(express.json());

// Route dasar
app.get('/', (req, res) => {
  res.send('Ngapain bray..??!');
});

app.post('/', async (req, res) => {
  // console.log(req.body)

  if (req.body.TOKEN != TOKEN) {
    res.status(401).json({ message: 'Anda tidak memiliki hak akses di sini..!' });
  } else {
    
    const filename = uniqid()+'.pdf'
    const fileNameSurat = filename;
    const outputNameSurat = filename;
    const passphrase = req.body.passphrase;
    const nik = req.body.nik;
    const tagTTDX = req.body.tagTTDX;
  
  
    var converttofile = await base64toPDF(req.body, filename)
    console.log("converttofile", converttofile)
  
  
    if (converttofile.status !== 200) {
      res.json(converttofile)
    } else {
      var ttdSuratxx = await ttdSurat3(fileNameSurat, outputNameSurat, passphrase, nik, tagTTDX);
      console.log("ttdSuratxx", ttdSuratxx)
      if (ttdSuratxx.status !== 200) {
        res.json(ttdSuratxx)
      } else {
        var converttobase64 = await pdfToBase64(filename)
        res.json(converttobase64)
        
      }
  
  
  
      
    }


  }


  





});



const ttdSurat3 = async (fileNameSurat, outputNameSurat, passphrase, nik, tagTTDX) => {
  const uploadss = 'publish/';

  console.log(fileNameSurat);

  const path = uploadss + fileNameSurat;
  const path1 = uploadss + outputNameSurat;

  console.log(uploadss + 'logo_ttd.png');

  var body = new FormData();
  body.append('file', fs.createReadStream(path));
  body.append('imageTTD', fs.createReadStream('publish/logo_ttd.png'));
  body.append('nik', nik);
  body.append('passphrase', passphrase);
  body.append('tampilan', 'visible');
  body.append('image', 'true'); //Wajib diisi jika linkQR tidak ada
  // body.append('linkQR', URL_SERVER + outputNameSurat); //Wajib diisi jika image false
  body.append('width', '75');
  body.append('height', '20');
  body.append('tag_koordinat', tagTTDX);



  let auth = "Basic " + Buffer.from(Username + ":" + Password).toString('base64')


  // console.log(auth)
  // console.log("username :", Username)
  // console.log("pass :", Password)

  const streamPipeline = promisify(pipeline);
  var API_FETCH = URL_TTEX
  // var API_FETCH = 'http://103.150.92.230/api/sign/pdf'

  return new Promise((resolve, reject) => {

    fetch(API_FETCH, {
      method: "POST",
      headers: {
        "Authorization": auth
      },
      body: body,
    })

      .then(async (res_data) => {

        // console.log(res_data.status);

        if (res_data.status == 200) {
          console.log("SUDAH BENAR");
          await streamPipeline(res_data.body, createWriteStream(path1));
          // res.send("SUDAH BENAR")
          // return (200)

          resolve({
            status: 200,
            ket: "Dokumen Berhasil ditandatangani"
          })




        } else {
          // console.log("KELIRU TTEEE3 200")
          // return res_data.json();
          resolve({
            status: 404,
            ket: {message: res_data, ket : "Periksa kembali passphrase dan NIK anda"}
          })

        }
      })
      .then(async (result) => {
        console.log(result)

        resolve({
            status: 404,
            ket: result
          })

        // resolve(result)
      })
  })








}

const base64toPDF = (body, filename) => {

  return new Promise((resolve, reject) => {



    const { filebase64 } = body;

    // Validasi dasar
    if (!filename || !filebase64) {
      // return res.status(400).json({ message: 'Filename dan base64 wajib diisi.' });

      resolve({
        status: 400,
        ket: 'Filename dan base64 wajib diisi.'
      })
    }

    // Hapus prefix jika ada (kadang base64 dikirim dengan "data:application/pdf;base64,...")
    const base64Data = filebase64.replace(/^data:application\/pdf;base64,/, '');

    const filePath = path.join(__dirname, 'publish', filename);

    // Simpan file PDF
    fs.writeFile(filePath, base64Data, 'base64', (err) => {
      if (err) {
        console.error('Gagal menyimpan file:', err);
        // resolve('Gagal menyimpan file.')
        resolve({
          status: 500,
          ket: 'Gagal menyimpan file.'
        })
        // return res.status(500).json({ message: 'Gagal menyimpan file.' });
      }
      // res.status(200).json({ message: 'File PDF berhasil disimpan.', filePath });
      // resolve('File PDF berhasil disimpan.', filePath)
      resolve({
        status: 200,
        ket: 'File PDF berhasil disimpan.', filePath
      })


    });













  })



}

const pdfToBase64 = (filenamex) => {

  const filename = filenamex;



  return new Promise((resolve, reject) => {
    
    
      if (!filename) {
        return res.status(400).json({ message: 'Filename wajib diisi.' });
      }
    
      const filePath = path.join(__dirname, 'publish', filename);
    
      // Cek apakah file ada
      if (!fs.existsSync(filePath)) {
        // return res.status(404).json({ message: 'File tidak ditemukan.' });

        resolve({
          status: 404,
          ket: 'File untuk di TTE tidak ditemukan.'
        })


      }
    
      try {
        // Baca file dan konversi ke base64
        const fileData = fs.readFileSync(filePath);
        const base64String = fileData.toString('base64');
    
        // Kirim respons
        // res.status(200).json({
        //   filename,
        //   base64: `data:application/pdf;base64,${base64String}`
        // });

        resolve({
          status: 200,
          filename,
          base64: `data:application/pdf;base64,${base64String}`
        })
        


      } catch (err) {
        console.error('Gagal membaca file:', err);
        // res.status(500).json({ message: 'Terjadi kesalahan saat membaca file.' });


        resolve({
          status: 500,
          ket: 'Terjadi kesalahan saat membaca file.'
        })


      }
    
  })





}




// Jalankan server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
