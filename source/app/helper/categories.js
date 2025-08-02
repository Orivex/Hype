const categories = [
  { label: 'Social Media', value: 1, imagePath: require('@/assets/images/categories/social_media.jpg')  },
  { label: 'News', value: 2, imagePath: require('@/assets/images/categories/news.jpg')  },
  { label: 'Politics', value: 3, imagePath: require('@/assets/images/categories/politics.jpg') },
  { label: 'Economy', value: 4, imagePath: require('@/assets/images/categories/economy.jpg')  },
  { label: 'Technology', value: 5, imagePath: require('@/assets/images/categories/technology.jpg')  },
  { label: 'Sports', value: 6, imagePath: require('@/assets/images/categories/soccer.jpg') },
  { label: 'Film industry', value: 7, imagePath: require('@/assets/images/categories/film_industry.jpg') },
  { label: 'Music', value: 8, imagePath: require('@/assets/images/categories/music.jpg')  },
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