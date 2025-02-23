Map.addLayer(AOI, {}, 'Kolkata');
Map.centerObject(AOI,8);

//satellite data import

var Imgs2 = S2.filterDate('2020-01-01', '2022-09-30')
           .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 1))
           .filterBounds(AOI)
           .median()
           .clip(AOI);
           
Map.addLayer(Imgs2, FCC, 'S2');  

var training = (Vegetation).merge(Settlement).merge(Waterbody).merge(Barren_Land)
print(training,'Training');

var label = 'Class';
var bands = ['B2', 'B3', 'B4', 'B8']; 
var input = Imgs2.select(bands);

var trainImage = input.sampleRegions({
  collection: training,
  properties: [label],
  scale: 30
});

var trainingData = trainImage.randomColumn();
var trainSet = trainingData.filter(ee.Filter.lessThan('random', 0.8));
var testSet = trainingData.filter(ee.Filter.greaterThanOrEquals('random', 0.8));

var classifier = ee.Classifier.smileCart().train(trainSet, label, bands);

var classified = input.classify(classifier)
print(classified);


Map.addLayer(classified, {}, 'classification');


Export.image.toDrive({
  image: classified,
  description: 'Kolkata_LULC_2020',
  scale: 10,
  region: AOI,
  maxPixels: 1e13});
