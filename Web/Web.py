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
    return render_template('first_app.html',form=form)

@app.route('/hello', methods=['POST'])
def hello():
    form = HelloForm(request.form)
    if request.method == 'POST' and form.validate():
        name = request.form['sayhello']
        return render_template('hello.html', name=name)
    return render_template('first_app.html', form=form)

if __name__ == "__main__":
    # webサーバー立ち上げ
    app.run()
