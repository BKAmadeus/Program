# import module
from flask import Flask, render_template, Response,request,redirect,url_for
import datetime
from PIL import Image
import io

app = Flask(__name__)
@app.route('/', methods=['GET', 'POST'])
def lionel(): 
    return render_template('index.html')

@app.route('/hello/')
def hello(): 
    return render_template('hello.html')


if __name__== '__main__':
    app.run()