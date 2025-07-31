const categories = [
  { label: 'Sports', value: 1, imagePath: require('@/assets/images/categories/soccer.jpg') },
  { label: 'Politics', value: 2, imagePath: require('@/assets/images/categories/politics.jpg') },
  { label: 'Film industry', value: 3, imagePath: require('@/assets/images/categories/film_industry.jpg') },
  { label: 'Technology', value: 4, imagePath: require('@/assets/images/categories/technology.jpg')  },
  { label: 'News', value: 5, imagePath: require('@/assets/images/categories/news.jpg')  },
]

export const mapCategory = (value) => {
  try {
    return (categories.find(cat => cat.value == value)).label;
  }
  catch(e) {
    console.error("error when mapping category: ", e);
  }
}

export default categories