import seaborn as sns
import matplotlib.pyplot as plt

features = ['income', 'cibil', 'dti_ratio']
coefficients = [1.2, 1.5, -1]

sns.barplot(y = features, x = coefficients)
plt.show()