from flask import Flask, render_template, request
from wtforms import Form, TextAreaField, validators
app = Flask(__name__)

# http://127.0.0.1:5000をルートとして、("")の中でアクセスポイント指定
# @app.route("hoge")などで指定すると、http://127.0.0.1:5000/hogeでの動作を記述できる。
class HelloForm(Form):
    sayhello = TextAreaField('',[validators.DataRequired()])

@app.route("/")
def index():
    form = HelloForm(request.form)
    return render_template('test1.html',form=form)

@app.route('/test')
def hello():
    form = HelloForm(request.form)
    return render_template('test.html',form=form)

if __name__ == "__main__":
    # webサーバー立ち上げ
    app.run()
