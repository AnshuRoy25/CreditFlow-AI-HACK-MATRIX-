import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

#loading dataset
df = pd.read_csv('data.csv')

sns.scatterplot(data=df, x='annual_income', y='cibil_score', hue='approved')

plt.show()