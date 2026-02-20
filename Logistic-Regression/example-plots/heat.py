import seaborn as sns
import matplotlib.pyplot as plt

data = [[3, 4, 5], [0, 6, 1], [4, 3, 7], [2, 8, 9], [3, 5, 1]]

plt.figure(figsize=(8, 6))
sns.heatmap(data, vmin = 0, vmax = 10, annot=True, cmap='Blues')
plt.show()