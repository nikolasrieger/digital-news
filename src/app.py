import os
import subprocess
from gtts import gTTS
from flask import Flask, jsonify, request
from flask_cors import CORS
import base64
import json

app = Flask(__name__)
CORS(app)

class LipSync:
    def __init__(self, text):
        self.text = text

    def __convert_text_to_audio(self, audio_file: str):
        tts = gTTS(self.text, tld='ca', lang='en')
        tts.save(audio_file)


    def __generate_lip_sync(self, audio_file: str, output_file: str):
        ffmpeg_path = os.path.abspath("./lib/ffmpeg/bin/ffmpeg")
        rhubarb_path = os.path.abspath("./lib/rhubarb-lip-sync/rhubarb")

        command = f'"{ffmpeg_path}" -y -i {audio_file} audio.wav'
        subprocess.run(command, shell=True, check=True)

        command = f'"{rhubarb_path}" -f json -o {output_file} audio.wav -r phonetic'
        subprocess.run(command, shell=True, check=True)

    def run_lip_sync(self, audio_file: str = "audio.mp3", output_file: str = "output.json"):
        print("in")
        self.__convert_text_to_audio(audio_file)
        self.__generate_lip_sync(audio_file, output_file)

        with open(output_file, 'r') as f:
            lipsync_data = json.load(f)
        
        with open(audio_file, "rb") as audio_file:
            audio_base64 = base64.b64encode(audio_file.read()).decode('utf-8')
        
        return audio_base64, lipsync_data


@app.route("/generate_lip_sync", methods=["POST"])
def generate_lip_sync():
    try:
        data = request.json
        text = data.get("text")
        facial_expression = "neutral" #Choose from: smile, sad, angry, surprised, funnyFace, and default"
        animation = "TalkingOne" #Choose from: Idle, TalkingOne, TalkingThree, SadIdle, Defeated, Angry, Surprised, DismissingGesture, and ThoughtfulHeadShake.

        if not text:
            return jsonify({"error": "No text provided"}), 400

        lipsync_generator = LipSync(text)
        audio_base64, lipsync_data = lipsync_generator.run_lip_sync()

        response = {
            "text": text,
            "facialExpression": facial_expression,
            "animation": animation,
            "audio": f"data:audio/mp3;base64,{audio_base64}",
            "lipsync": lipsync_data,
        }

        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
