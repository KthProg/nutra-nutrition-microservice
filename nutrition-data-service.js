const express = require('express'),
  app = express(),
  port = process.env.PORT || 3000;

app.listen(port);

console.log(`Nutrition microservice API server started on ${port}`);

const fetch = require('node-fetch');

const scoreNutrients = (food) => {
  // TODO: actually score this instead of making a completely
  // arbitrary calculation.
  return {
    food,
    nutrientsScore: food.foodNutrients.reduce((score, nutrient) => {
      return score + (nutrient.value / food.foodNutrients.length);
    }, 0)
  };
};

const scoreAllNutrients = (foods) => 
  foods.map(food => scoreNutrients(food));

app.route('/nutrition').get(async (req, resp) => {
  const query = req.query.query;

  console.log(`Nutrition data requested, query: ${query}`);

  const searchResultsRaw = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?query=${query}&pageSize=10&api_key=88OqolzfEIxEZYwPqqX8KuTXJYZn8SDIGYfVEMfl`);
  const searchResults = await searchResultsRaw.json();
  const foods = searchResults.foods;

  const scoredFoods = scoreAllNutrients(foods);

  scoredFoods.sort((scoredFoodA, scoredFoodB) => scoredFoodB.nutrientsScore - scoredFoodA.nutrientsScore);

  resp.status(200).json(scoredFoods);
});