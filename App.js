import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  Animated,
  Alert,
} from 'react-native';

export default function App() {
  const [enteredGoalText, setEnteredGoalText] = useState('');
  const [courseGoals, setCourseGoals] = useState(['Eat', 'Sleep', 'REPEAT!']); // Pre-loaded goals
  const [completedGoals, setCompletedGoals] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [completedGoalsToFade, setCompletedGoalsToFade] = useState([]);
  const [fadeDuration] = useState(new Animated.Value(1));
  const goalsPerDeletion = 3; // Number of completed goals per deletion

  function goalInputHandler(enteredGoalText) {
    setEnteredGoalText(enteredGoalText);
  }

  function startFadeOutAnimation(goal) {
    Animated.timing(fadeDuration, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: false,
    }).start(() => {
      // Animation is complete, remove the faded goal from completedGoalsToFade
      setCompletedGoalsToFade((prevCompletedGoalsToFade) =>
        prevCompletedGoalsToFade.filter((item) => item !== goal)
      );
      // Reset the opacity value for future animations
      fadeDuration.setValue(1);
    });
  }

  useEffect(() => {
    if (completedGoalsToFade.length > 0) {
      // Start the fade-out animation for the first completed goal
      startFadeOutAnimation(completedGoalsToFade[0]);
    }
  }, [completedGoalsToFade]);

  function addGoalHandler() {
    if (enteredGoalText.trim() === '') {
      Alert.alert('Invalid Goal', 'Please enter a valid goal.');
    } else {
      setCourseGoals((currentCourseGoals) => [...currentCourseGoals, enteredGoalText]);
      setEnteredGoalText('');
      setModalVisible(false);
    }
  }

  function markGoalComplete(index) {
    const completedGoal = courseGoals[index];
  
    // Show a confirmation dialog
    Alert.alert(
      'Complete Goal',
      `Are you sure you want to mark "${completedGoal}" as completed?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            setCourseGoals((currentCourseGoals) => {
              const updatedGoals = [...currentCourseGoals];
              updatedGoals.splice(index, 1);
              setCompletedGoals((prevCompletedGoals) => [
                ...prevCompletedGoals,
                completedGoal,
              ]);
  
              setCompletedGoalsToFade((prevCompletedGoalsToFade) => [
                ...prevCompletedGoalsToFade,
                completedGoal,
              ]);
  
              // Check if it's time to delete completed goals
              if (completedGoals.length % goalsPerDeletion === 0) {
                // Delay the deletion for a smoother animation
                setTimeout(() => {
                  deleteCompletedGoals();
                }, 1000);
              }
              return updatedGoals;
            });
          },
        },
      ],
      { cancelable: false }
    );
  }
  
  function deleteCompletedGoals() {
    setCompletedGoals([]);
    setCompletedGoalsToFade([]);
  }

  return (
    <View style={styles.appContainer}>
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.addGoalButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addGoalButtonText}>Add Goal</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
      >
        <View style={styles.modalContainer}>
          <View style={styles.inputWrapper}>
            <Image
              source={require('./assets/trophy-icon.png')}
              style={styles.imageStyle}
            />
            <TextInput
              style={styles.modalTextInput}
              placeholder="Enter Goal"
              onChangeText={goalInputHandler}
              value={enteredGoalText}
            />
          </View>
          <TouchableOpacity
            style={styles.modalAddGoalButton}
            onPress={addGoalHandler}
          >
            <Text style={styles.addGoalButtonText}>Add Goal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalCancelButton}
            onPress={() => {
              setModalVisible(false);
              setEnteredGoalText('');
            }}
          >
            <Text style={styles.modalCancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <FlatList
        style={styles.goalsContainer}
        data={courseGoals}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity onPress={() => markGoalComplete(index)}>
            <GoalItem goal={item} />
          </TouchableOpacity>
        )}
      />

      <View style={styles.completedGoalsContainer}>
        {completedGoals.map((goal, index) => (
          <Animated.View
            key={index}
            style={[
              styles.completedGoal,
              { opacity: fadeDuration },
            ]}
          >
            <Image
              source={require('./assets/trophy-icon.png')}
              style={styles.trophyIcon}
            />
            <Text style={styles.completedGoalText}>{goal}</Text>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

function GoalItem({ goal }) {
  return (
    <View style={styles.goalItem}>
      <Text style={styles.goalText}>{goal}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  appContainer: {
    paddingTop: 50,
    paddingHorizontal: 16,
    flex: 1,
    backgroundColor: '#f0f0f0',
    
    justifyContent: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'center', // Center horizontally
    alignItems: 'center', // Center vertically
    marginBottom: 24,
    marginTop: 20,
  },
  addGoalButton: {
    backgroundColor: '#FF6666',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  addGoalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  goalsContainer: {
    flex: 1,
    marginTop: 20,
  },
  goalItem: {
    backgroundColor: '#E0E0E0',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  goalText: {
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalTextInput: {
    borderWidth: 1,
    borderColor: '#B46060',
    width: '70%',
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  modalAddGoalButton: {
    backgroundColor: '#FF6666',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
  },
  modalCancelButton: {
    backgroundColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalCancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageStyle: {
    width: 40, // Adjust the width and height as needed
    height: 40,
    marginRight: 10, // Add some margin to separate the image from TextInput
    marginTop: -15,
  },

  completedGoal: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  trophyIcon: {
    width: 24, // Adjust the width and height as needed
    height: 24,
    marginRight: 10, // Add some margin to separate the trophy icon from the goal text
  },
  completedGoalsContainer: {
    marginBottom: 30,
    marginLeft: 10,
  },

  completedGoalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#CBC4AA', // Add this line to set the text color
},

});