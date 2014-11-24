<h1>simdfied (WIP) - <a target="_blank" href="http://www.simdfied.org">www.simdfied.org</a></h1>

<h2>Machine Learning. browser easy.</h2>
<p>simdfied is a ML javascript library, utilizing <a target="_blank" href="http://en.wikipedia.org/wiki/SIMD">SIMD</a> for matrix operations (WIP)<br>Easily connect your local data and run classic <a target="_blank" href="http://en.wikipedia.org/wiki/Supervised_learning">supervised</a> and <a target="_blank" href="http://en.wikipedia.org/wiki/Unsupervised_learning"> unsupervised</a> algorithms</p>
<p>Combined with latest HTML5 technology, your data gets even closer to your browser, allowing for a zero-server ML web apps. Check out <a target="_blank" href="http://www.mlplayground.org">ML Playground</a>, it's powered by simdfied and does exactly that!</p>
<p>simdfied is 100% pure javascript and is licensed under the MIT open-source <a target="_blank" href="https://github.com/morkrispil/simdfied/blob/master/LICENSE.md">license</a></p>
<h2>SIMD technology</h2>
<p><a target="_blank" href="http://en.wikipedia.org/wiki/SIMD">SIMD</a> allows for multiple computations in a single CPU instruction<br>It's even cooler when it comes to vectorized matrix operations, traditionally utilized only by desktop software</p>
<p>Latest <a target="_blank" href="https://01.org/blogs/tlcounts/2014/bringing-simd-javascript">collaboration</a> by Intel, Google and Mozilla, enables a preview native SIMD support for firefox-nightly and chromium browsers!</p>
<p>simdfied embraces the initiation and provides browsers with SIMD compatibility, as it gets popular</p>


<h2>Example</h2>
<p>//house prices prediction, using linear regression:</p>
<p>//load our X matrix with 2 features: square foot and number of bedrooms
<br>
var X = simdfied.mat().from2dArray([[645, 860, 1000, 1300, 1400], [2, 3, 3, 4, 5]]);</p>
<p>//load our y vector with house prices
<br>var y = simdfied.vec().fromArray([250000, 350000, 400000, 550000, 700000]);</p>
var ml = simdfied.ml().algo("linReg").X(X).y(y).set("iter", 1500);<br>
ml.run(function(ml){ ml.predOne([900, 3]); });</p>

<p>> running linear regression
<br>> normalization done (4ms)
<br>> initial cost: 113,750,000,000.00
<br>> gradientDescent done (209ms)
<br>> cost after #1501 iterations 154,786,244.34
<br>> predicting for features [900,3] the value of 380,217.40
</p>

<h3>Check our wiki <a href="https://github.com/morkrispil/simdfied/wiki">API!</a></h3>
