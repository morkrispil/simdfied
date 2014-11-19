<h1>simdfied (WIP)</h1>

<h2>Machine Learning. browser easy</h2>
<p>
Easily connect your local data and run classic <a target="_blank" href="http://en.wikipedia.org/wiki/Supervised_learning">supervised</a> and <a target="_blank" href="http://en.wikipedia.org/wiki/Unsupervised_learning"> unsupervised</a> algorithms (WIP)
</p><p>
Modern HTML file APIs brings the data even closer to your browser, allowing for a zero-server ML web app. Check out <a target="_blank" href="http://mlplayground.org">ML Playground</a>, it's powered by simdfied and does exactly that!
</p>
<h2>SIMD technology</h2>
<p>
<a target="_blank" href="http://en.wikipedia.org/wiki/SIMD">SIMD</a> allows for multiple numbers processing in a single CPU instruction. It's even cooler when it comes to vectorized matrix operations, traditionally used only by ml and statistics desktop software
</p><p>
Latest <a target="_blank" href="https://01.org/blogs/tlcounts/2014/bringing-simd-javascript">collaboration</a> by Intel, Google and Mozilla, enables a preview native SIMD support for firefox-nightly and chromium browsers!
</p><p>
simdfied embraces the initiation and aims for javascript matrix and ML SIMD based operations, enabling backward compatibility along the way

<h2>Example</h2>
<p>//house prices prediction, using linear regression:</p>
<p>//load our X matrix with 2 features: square foot and number of bedrooms
<br>
var X = simdfied.mat().from2dArray([[645, 860, 1000, 1300, 1400], [2, 3, 3, 4, 5]]);</p>
<p>//load our y vector with house prices
<br>var y = simdfied.vec().fromArray([250000, 350000, 400000, 550000, 700000]);</p>
<p>//run and predict a price for a 3 bedroom, 900 square foot house:
<br>var ml = simdfied.ml().algo("linReg").X(X).y(y).run().predOne([3, 900]);</p>

<p>> running linear regression
<br>> normalization done (4ms)
<br>> initial cost: 113,750,000,000.00
<br>> gradientDescent done (209ms)
<br>> cost after #1501 iterations 154,786,244.34
<br>> predicting for features [900,3] the value of 380,217.40
</p>

