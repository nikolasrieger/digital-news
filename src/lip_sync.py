import subprocess
from gtts import gTTS
import os


class LipSync:
    def __init__(self, text):
        self.text = text

    def __convert_text_to_audio(self, audio_file: str):
        tts = gTTS(self.text)
        tts.save(audio_file)

    def __generate_lip_sync(self, audio_file: str, output_file: str):
        ffmpeg_path = os.path.abspath("./lib/ffmpeg/bin/ffmpeg")
        rhubarb_path = os.path.abspath("./lib/rhubarb-lip-sync/rhubarb")

        command = f'"{ffmpeg_path}" -y -i {audio_file} audio.wav'
        subprocess.run(command, shell=True, check=True)

        command = f'"{rhubarb_path}" -f json -o {output_file} audio.wav -r phonetic'
        subprocess.run(command, shell=True, check=True)

    def run_lip_sync(
        self, audio_file: str = "audio.mp3", output_file: str = "output.json"
    ):
        self.__convert_text_to_audio(audio_file)
        self.__generate_lip_sync(audio_file, output_file)

if __name__ == "__main__":
    article_text = """This is a test article. Everything is new and better than before."""
    ls = LipSync(article_text)
    ls.run_lip_sync()
