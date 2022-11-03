let express = require("express");
let app = express();
let { toBuffer } = require("qrcode");

const {
  default: makeWASocket,
  useSingleFileAuthState,
  Browsers,
  delay,
} = require("@adiwajshing/baileys");

const pino = require("pino");
let PORT = process.env.PORT || 8080;//caso não funcione na porta 8080 mude 8080 para porta 4040

const PastebinAPI = require("pastebin-js"),
  pastebin = new PastebinAPI("h4cO2gJEMwmgmBoteYufW6_weLvBYCqT");
app.use("/", (req, res) => {
  const authfile = `./tmp/${makeid()}.json`;
  const { state } = useSingleFileAuthState(authfile, pino({ level: "silent" }));
  function oni() {
    try {
      let session = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: pino({ level: "silent" }),
        browser: Browsers.macOS("Desktop"),
        downloadHistory: false,
        syncFullHistory: false,
      });



      session.ev.on("connection.update", async (s) => {
        if (s.qr) {
          res.end(await toBuffer(s.qr));
        }
        const { connection, lastDisconnect } = s;
        if (connection == "open") {
          await delay(500 * 10);
          let link = await pastebin.createPasteFromFile(
            authfile,
            "oni-bot session",
            null,
            0,
            "N"
          );
          let data = link.replace("https://pastebin.com/", "");
          let code = btoa(data);
          var words = code.split("");
          var ress = words[Math.floor(words.length / 2)];
          let c = code.split(ress).join(ress + "_oni-bot_");

          const templateButtons = [
            {
              index: 1,
              urlButton: {
                displayText: "Copy Code",
                url: `https://www.whatsapp.com/otp/copy/${c}`,
              },
            },
            {
              index: 2,
              urlButton: {
                displayText: "heroku-deploy",
                url: `github.com/reioni/qr-deploy`,
              },
            },
          ];

          const templateMessage = {
            text: `\nONI-BOT SESSÃO MD
          Oii, Copie seu id de seção e termine de configurar sua conexão com o oni-bot clique em "heroku-deploy"

◕ ⚠️sr.Oni adverte: NÃO COMPARTILHE SEU ID DE SESSÃO PARA NINGUEM`,
            footer: "oni-sᴇssɪᴏɴ",
            templateButtons: templateButtons,
          };

          await session.sendMessage(session.user.id, templateMessage);
          await session.sendMessage(session.user.id, {
            document: { url: authfile },
            fileName: "oni-session.json",
            mimetype: "application/json",
          });

          await delay(3000 * 10);// reseta o qr code em 30 segundos
          process.send("reset");
        }
        if (
          connection === "close" &&
          lastDisconnect &&
          lastDisconnect.error &&
          lastDisconnect.error.output.statusCode != 401
        ) {
          oni();
        }
      });
    } catch (err) {
      console.log(
        err + "Ocorreu um erro desconhecido, relate -se ao proprietário e fique atento"
      );
    }
  }

  oni();
});
app.listen(PORT, () => console.log("Aplicativo ouvido na porta", PORT));

const encrypt = (text) => {
  return CryptoJS.AES.encrypt(text, (passphrase = "123")).toString();
};

const decrypt = (text) => {
  return CryptoJS.AES.decrypt(text, passphrase).toString();
};

function makeid(num = 9) {
  var result = "";
  var characters =
    "ABCfsgeughguhDEFGHIJKLMNOPQRSTU07380965VWXYZabcdefghijklmnopqrstuvwxyz0123456789p5tteytsi";
  var characters9 = characters.length;
  for (var i = 0; i < num; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters9));
  }
  return result;
}

let encode = (f) => {
  return f.replace("=", "#");
};
