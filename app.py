from flask import Flask, render_template


app = Flask(__name__)


@app.route('/')
def home():
    return render_template('index.html')

@app.route('/experience')
def experience():
    return render_template('experience.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/product/<int:product_id>')
def product(product_id):
    return render_template('product.html', product_id=product_id)

if __name__ == '__main__':
    app.run(debug=True)