import seaborn as sns
import matplotlib.pyplot as plt
import pandas as pd


df = pd.DataFrame({
    'age': [5, 3, 4, 5, 6, 3, 4, 5, 2, 3, 4],
    'gender': ['Male', 'Female', 'Male', 'Female', 'Male', 'Female', 'Female', 'Male', 'Female', 'Female', 'Male']   
})


sns.histplot(data=df, x="age", bins=5, hue = 'gender', alpha=0.6)
plt.show()