from flask import Flask, render_template
from flask import request
import csv
with open('test.csv', 'a', encoding='utf8') as f:
    writer = csv.writer(f)
    app = Flask(__name__)
    count = 0
    list1 = list([count])
    # トップ画面
    @app.route('/')
    def index():
        return render_template('index.html')

    # get処理の入力フォームを表示
    @app.route("/request_get")
    def get():
        return render_template('send_get.html')

    # getでの入力情報処理
    @app.route("/receive_get", methods=["GET"])
    def receive_get():
        global list1
        name = request.args["my_name"]
        if len(name) == 0:
            list1.append(45)
            return render_template('test.html')
        else:
            list1.append(name)
            return render_template('test.html')

    # post処理の入力フォームを表示
    @app.route("/request_post", methods=["GET"])
    def post_sample():
        return render_template('send_post.html')

    # postでの入力情報処理
    @app.route("/request_post", methods=["POST"])
    def post_action():
        name = request.form["my_name"]
        if "gender" in request.form.keys():
            gender = request.form["gender"]
            if gender == "男":
                sex = '男性'
            elif gender == "女":
                sex = "女性"
        else:
            sex = '性別不明'

        if 'age' in request.form.keys():
            age_range = request.form['age']
        else:
            age_range = '年齢不詳'
        global list1
        global count
        list1.append(sex)
        list1.append(name)
        list1.append(age_range)
        writer.writerow(list1)
        print(list1)
        count = count + 1
        list1 = list([count])
        return render_template('test1.html')


    # テスト環境起動
    app.run(debug=True)
