import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Image } from 'react-native';
import { Menu, Button, ActivityIndicator, Card, IconButton, Text, Divider, Appbar } from 'react-native-paper';

export const GalleryScreen = (props) => {
  const loading = <ActivityIndicator 
    animating={true} 
    style={{ marginTop: 10, marginBottom: 10 }}
  />;

  const [displayScreen, setDisplayScreen] = useState(<View>{loading}</View>);

  const setClubs = async () => {
    const results = await getClubs();
    // const clubs = results.map((step, move) => step.name);
    const resetToGalleryMainSubScreen = () => setDisplayScreen(<GalleryMainSubScreen 
      data={results}
      display={setDisplayScreen}
      goBack={resetToGalleryMainSubScreen}
    />);

    // console.log(clubs);

    setDisplayScreen(<GalleryMainSubScreen 
      data={results}
      display={setDisplayScreen}
      goBack={resetToGalleryMainSubScreen}
    />)
  }

  useEffect(() => {
    setClubs();
  }, []);

  return (
    <View>
      {displayScreen}
    </View>
  )
}

const GalleryMainSubScreen = props => {
  const data = props.data;
  const display = props.display;
  const goBack = props.goBack;

  const cards = data.map((step, move) => {
    return ([
      <GalleryCard 
        subject={step.name}
        onPress={() => display(
          <Gallery 
            club={step.name}
            goBack={goBack}
          />
        )}
        key={move}
      />, step.owned]);
  });

  const ownedCards = cards.filter(card => card[1]).map((step, move) => step[0]);
  const allCards = cards.filter(card => card[0]).map((step, move) => step[0]);
  
  return (
    <ScrollView>
      <Text variant={'titleLarge'} style={styles.categoryTitle}>My Clubs</Text>
      <Divider style={styles.divider} bold={true}/>
      <View>
        {ownedCards}
      </View>

      <Text variant={'titleLarge'} style={styles.categoryTitle}>Browse</Text>
      <Divider style={styles.divider} bold={true}/>
      <View>
        {allCards}
      </View>
    </ScrollView>
  )
}

const GalleryCard = props => {
  const subject = props.subject;
  const onPress = props.onPress;

  return (
    <Card style={styles.card}>
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
 * return array of objects
 * [
 * {
 *  name: str,
 *  owned: boolean,
 * },..
 * ]
 */
const getClubs = async () => {
  let ret = [
    {
      name: 'FBLA',
      owned: true,
    },
    {
      name: 'Chess Club',
      owned: false,
    },
  ];

  return await new Promise((res) => setTimeout(() => res(ret), 1000));
}

/**
 * TODO: Implement adding image to gallery
 */
const Gallery = props => {
  const [filter, setFilter] = useState("Favorite");
  const club = props.club;
  const goBack = props.goBack;
  
  const addImage = () => {
    console.log(`image added to ${club}!`)
  }

  const selectFilter = (selectedFilter) => {
    setFilter(selectedFilter);
  }

  return(
    <View>
      <Appbar.Header statusBarHeight={0}>
        <Appbar.BackAction onPress={goBack} />
        <Appbar.Content title={club} />
        <Appbar.Action icon={'plus'} onPress={() => addImage()} />
      </Appbar.Header>
      <ScrollView>
        <View style={styles.layout}>
          <MiniMenu filter={filter} selectFilter={selectFilter} />
        </View>
        <ImageList club={club} filter={filter}/>
      </ScrollView>
    </View>
  );
}

const ImageList = (props) => {
  const [images, setImages] = useState(<ActivityIndicator 
                                          animating={true} 
                                          style={{ marginTop: 10, marginBottom: 10 }}
  />);

  const club = props.club;

  async function getImages(filter) {
    setImages(<ActivityIndicator animating={true} style={{ marginTop: 10, marginBottom: 10 }}/>)
    const data = await getFilteredImages(club, filter);

    const imgComponents = data.map((step, move) => {
      return (
        <ImageCard 
          source={{ uri: step.src }}
          postedBy={step.postedBy}
          caption={step.caption}
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

    setImages(<View style={styles.imgMatrixLayout}>{imgMatrix}</View>);
  }

  // see ClubsScreen.js for explanation
  // need to observe props.filter because images should change when that filter is changed
  useEffect(() => {
    getImages(props.filter);
  }, [props.filter])

  return (
    <View>
      {images}
    </View>
  );
}

const ImageCard = props => {
  const source = props.source.uri;
  const postedBy = props.postedBy;
  const caption = props.caption;

  return (
    <Card style={styles.imgCard}>
      <Card.Cover source={{ uri: source }}/>
      <Card.Content style={styles.imgCardContent}>
        <Text variant={'bodySmall'} style={styles.imgCardText}>Posted by: {postedBy}</Text>
        <Text variant={'bodySmall'} style={styles.imgCardText}>{caption}</Text>
      </Card.Content>
    </Card>
  );
}

// TODO: Implement backend
async function getFilteredImages(club, filter) {
  /* RETURN FORMAT: [{
    src: str
    postedBy: str
    caption: str
  }...]
  */
  let clubSrc;
  switch(club) {
    case "FBLA":
      clubSrc = 'https://picsum.photos/110/110';
      break;

    case "Chess Club": 
      clubSrc = 'https://picsum.photos/90/90';
      break;

    default:
      clubSrc = 'https://picsum.photos/100/100';
      break;
  }

  let ret = {postedBy: 'n/a', caption: 'Caption!'};
  switch (filter) {
    case "Favorite":
      ret = Array(2).fill({ ...ret, src: clubSrc });
      break;
      
    case "School":
      ret = Array(25).fill({ ...ret, src: clubSrc });
      break;

    case "Club 1":
      ret = Array(9).fill({ ...ret, src: clubSrc });
      break;

    case "Club 2":
      ret = Array(50).fill({ ...ret, src: clubSrc });
      break;
  }

  ret = ret.map(r => ({...r, postedBy: 'A'.repeat(Math.floor(Math.random() * 100))}));

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
    const clubNames = await getAvailableFilters();

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
// may just use preset filters or remove altogether... ?
async function getAvailableFilters() {
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
  categoryTitle: {
    margin: 15,
  },
  divider: {
    marginLeft: 30,
    marginRight: 30,
    marginBottom: 10,
  },
  card: {
    marginLeft: 15,
    marginRight: 15,
    marginBottom: 5,
  },
  imgMatrixLayout: {
    marginBottom: 150,
  },
  imgRowLayout: { 
    flex: 1, 
    flexDirection: "row", 
    width: "100%",
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
  imgCard: {
    flex: 1,
    padding: 5,
    margin: 5,
  },
  imgCardContent: {
    marginTop: 10,
  },
  imgCardText: {
    marginTop: 5,
  },
  imgHolder: {
    flex: 1,
  }
});
