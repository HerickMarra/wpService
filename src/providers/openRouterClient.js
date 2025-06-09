
const axios = require('axios');
const FileHelper = require('../helper/fileHelper');
const api_key = "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";
// const api_key = "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";

const patchPrompts = "storage/prompts";

 async function sendChat(data){
    const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        data,
        {
            headers: {
            'Authorization': `Bearer ${api_key}`,
            'Content-Type': 'application/json'
            }
        }
        );
        console.log(response.data);
    return response;
 }

 async function defaultData(systemPrompt = "ChatBot Normal",updtateMessages = null){
    let prompt = await FileHelper.readFile(patchPrompts+"/chatbot.txt");  
    return {
            model: 'opengvlab/internvl3-14b:free', // ou 'openai/gpt-4' se preferir
            messages: [
            { role: "system", content: prompt },
            ...updtateMessages
            ]
        }
 }




module.exports = {
    async startChat(updtateMessages) {
         let prompt = await FileHelper.readFile(patchPrompts+"/chatbot.txt"); 
         console.log(prompt);  
        //  let optimizePrompt = await FileHelper.readFile(patchPrompts+"/optimize.txt");   
        // //Substitui
        //  optimizePrompt = optimizePrompt
        //     .replaceAll("{{conversa_json}}", JSON.stringify(updtateMessages, null, 2))
        //     .replaceAll("{{prompt_original}}", prompt)
        //     .replaceAll("{{contexto}}", "você é minha namorada, seja o mais humana possivel, seja curta as vezes, tente sair de conversas repetidas");

        //  let optimize = await sendChat(defaultData(optimizePrompt, []));

        //  FileHelper.writeFile(patchPrompts+"/chatbot.txt",optimize.data.choices[0].message.content)
        //  prompt = await FileHelper.readFile(patchPrompts+"/chatbot.txt");  
        return sendChat(await defaultData(prompt, updtateMessages));
    }
}
