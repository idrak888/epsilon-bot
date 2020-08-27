const Discord = require("discord.js");
const bot = new Discord.Client();
const axios = require("axios");

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const { token, prefix, authToken } = require("./config.json");

let currentQ = {}

const dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);

const evaluateQ = mathML => {
    var span = dom.window.document.createElement('span');
    span.innerHTML = mathML;
    let text = span.textContent || span.innerText;

    let formattedQ = text.split("⨯")
    .join("*")
    .split("÷")
    .join("/");

    console.log(formattedQ);
    return eval(formattedQ);
}

const extractQ = mathML => {
    var span = dom.window.document.createElement('span');
    span.innerHTML = mathML;
    return span.textContent || span.innerText;
}

const generateRandom = msg => {
    let question;

    axios.get("https://studycounts.com/api/v1/arithmetic/simple.json?difficulty=advanced", {
        headers: {
            "Authorization": process.env.AUTH_TOKEN
        }
    }).then(doc => {
        question = doc.data.question;

        currentQ = {
            question: extractQ(question),
            answer: evaluateQ(question)
        }
        const embed = new Discord.MessageEmbed()

        .setTitle("Simple arithmetic - Give this a go.")
        .setDescription(currentQ.question)
        .setColor("ORANGE")
        .setFooter("No calculators allowed! 😉");

        msg.channel.send(embed);
    }).catch(e => {
        console.log(e);
    });
}

bot.on('ready', () => {
    console.log(`Bot ready`);
});

bot.on('message', msg => {
    let args = msg.content.substring(prefix.length).split(" ");

    if (!msg.content.startsWith(prefix)) return;
    if (msg.author.bot) return;

    switch(args[0]) {
        case "q":
            generateRandom(msg);
            break;
        case "a":
            if (!args[1]) return msg.channel.send("No answer provided! Please enter a valid number.");
            if (isNaN(eval(args[1]))) return msg.channel.send(`${args[1]} is not a number. Please provide a valid number.`);
            
            let userAnswer = args[1];
            if (eval(userAnswer) == currentQ.answer) {
                msg.channel.send(`Correct. Way to go ${msg.author.toString()}! ✅🔥`);
                msg.react("✅");
            } else {
                msg.channel.send(`Incorrect. Try again ${msg.author.toString()}! 🤔`);
            }

            break;
    }
});

bot.login(process.env.TOKEN);