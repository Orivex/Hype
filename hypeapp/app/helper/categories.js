const categories = [
  { label: 'Sports', value: 1 },
  { label: 'Politics', value: 2 },
  { label: 'Film industry', value: 3 },
  { label: 'Technology', value: 4 },
  { label: 'News', value: 5 },
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