import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Image } from 'react-native';
import { Menu, Button, ActivityIndicator, Card, IconButton, Text, Appbar } from 'react-native-paper';

export const GalleryScreen = (props) => {
  const loading = <ActivityIndicator 
    animating={true} 
    style={{ marginTop: 10, marginBottom: 10 }}
  />;

  const [displayScreen, setDisplayScreen] = useState(<View>{loading}</View>);

  const setClubs = async () => {
    const clubs = await getClubs();
    console.log(clubs);
    
    const cards = clubs.map((step, move) => {
      return (
      <GalleryCard 
        subject={step}
        onPress={() => setDisplayScreen(
          <Gallery 
            club={step}
            goBack={() => setDisplayScreen(<View>{cards}</View>)}
          />
        )}
        key={move}
      />);
    });

    setDisplayScreen(<View>{cards}</View>);
  }

  useEffect(() => {
    setClubs();
  }, []);

  return (
    <ScrollView>
      {displayScreen}
    </ScrollView>
  )
}

const GalleryCard = props => {
  const subject = props.subject;
  const onPress = props.onPress;

  return (
    <Card>
      <Card.Title 
        title={subject}
        right={props => <IconButton icon="arrow-right-drop-circle" onPress={onPress} />}
      />
    </Card>
  )
}

/**
 * TODO: Implement async getClubs()
 * 
 * return array of club names
 */
const getClubs = async () => {
  let ret = [
    'FBLA',
    'Chess Club',
  ];

  return await new Promise((res) => setTimeout(() => res(ret), 1000));
}

/**
 * TODO: Implement looking up images
 * based on props.club
 */
const Gallery = props => {
  const [filter, setFilter] = useState("Favorite");
  const club = props.club;
  const goBack = props.goBack;

  const selectFilter = (selectedFilter) => {
    setFilter(selectedFilter);
  }

  return(
    <View>
      <Appbar.Header statusBarHeight={0}>
        <Appbar.BackAction onPress={goBack} />
        <Appbar.Content title={club} />
      </Appbar.Header>
      <ScrollView>
        <View style={styles.layout}>
          <MiniMenu filter={filter} selectFilter={selectFilter} />
        </View>
        <ImageList filter={filter}/>
      </ScrollView>
    </View>
  );
}

const ImageList = (props) => {
  const [images, setImages] = useState(<ActivityIndicator 
                                          animating={true} 
                                          style={{ marginTop: 10, marginBottom: 10 }}
  />);

  async function getImages(filter) {
    setImages(<ActivityIndicator animating={true} style={{ marginTop: 10, marginBottom: 10 }}/>)
    const imgs = await getFilteredImages(filter);

    const imgComponents = imgs.map((step, move) => {
      return (
        <Image 
          style={[styles.img]}
          source={{ uri: step.src }}
          key={move}
        />
      )
    });

    const imgMatrix = Array(Math.floor(imgComponents.length / 3) + 1).fill(null);
    for (let row = 0; row < imgMatrix.length; row++) {
      const imgRow = Array(3).fill(null);
      
      for (let col = 0; col < 3; col++) {
        imgRow[col] = imgComponents[(row * 3) + col] ? 
                        imgComponents[(row * 3) + col] : 
                        <View style={styles.imgHolder} key={(row * 3) + col} />;
      }

      imgMatrix[row] = <View style={styles.imgRowLayout} key={row}>{imgRow}</View>;
    }

    setImages(<View>{imgMatrix}</View>);
  }

  // see ClubsScreen.js for explanation
  // need to observe props.filter because images should change when that filter is change
  useEffect(() => {
    getImages(props.filter);
  }, [props.filter])

  return (
    <View>
      {images}
    </View>
  );
}

// TODO: Implement backend
async function getFilteredImages(filter) {
  /* RETURN FORMAT: [{
    src: str
  }...]
  */
  let ret;
  switch (filter) {
    case "Favorite":
      ret = Array(2).fill({ src: 'https://picsum.photos/100/100' });
      break;
      
    case "School":
      ret = Array(25).fill({ src: 'https://picsum.photos/100/100' });
      break;

    case "Club 1":
      ret = Array(9).fill({ src: 'https://picsum.photos/100/100' });
      break;

    case "Club 2":
      ret = Array(50).fill({ src: 'https://picsum.photos/100/100' });
      break;
  }

  const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(ret);
    }, 1000)
  })
  
  return await promise;
}

const MiniMenu = (props) => {
  const selectFilter = (filter) => {
    props.selectFilter(filter)
    closeMenu();
  }

  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState(
    <View>
        <MiniMenuOption filter={"Favorite"} selectFilter={selectFilter} />
        <MiniMenuOption filter={"School"} selectFilter={selectFilter} />
    </View>
  );

  const filter = props.filter;

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  async function getOptions() {
    const clubNames = await getUserClubOptions();

    const opts = clubNames.map((step, move) => {
      return (
        <MiniMenuOption key={move} filter={step.name} selectFilter={selectFilter} />
      )
    })

    setOptions(
      <View>
        <MiniMenuOption filter={"Favorite"} selectFilter={selectFilter} />
        <MiniMenuOption filter={"School"} selectFilter={selectFilter} />
        {opts}
      </View>
    );
  }

  // see ClubsScreen.js for explanation
  // (don't need to watch any vars bc just doing once)
  useEffect(() => {
    getOptions();
  }, []);

  return (
    <View style={styles.menuContainer}>
      <Menu 
        visible={visible}
        onDismiss={closeMenu}
        anchor={<Button mode="outlined" onPress={openMenu} style={styles.menu}>{filter}</Button>}
      >
        {options}
      </Menu>
    </View>
  )
}

const MiniMenuOption = (props) => {
  const filter = props.filter;
  const selectFilter = props.selectFilter;
  
  return (
    <Menu.Item onPress={() => {selectFilter(filter)}} style={styles.menuItem} title={filter} />
  )
}

// TODO: Implement backend connection
async function getUserClubOptions() {
  /* RETURN FORMAT:
  [
  {
    name: "club name"
  },...
  ]
   */
  const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve([{ name: "Club 1" }, { name: "Club 2" }]);
    }, 1000)
  })
  
  return await promise;
}

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    alignItems: "center",
  },
  imgRowLayout: { 
    flex: 1, 
    flexDirection: "row", 
    width: "100%",
    height: 120,
  },
  menuContainer: {
    flex: 1,
    flexDirection: "row",
  },
  menu: {
    flex: 1,
    width: 200,
  },
  menuItem: {
    
  },
  img: {
    flex: 1,
    padding: 5,
    margin: 5,
  },
  imgHolder: {
    flex: 1,
  }
});
