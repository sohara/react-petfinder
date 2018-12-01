import React from "react";
import pf, { Pet as PetType } from "petfinder-client";
import Pet from "./Pet";
import SearchBox from "./SearchBox";
import { connect } from "react-redux";

if (!process.env.API_KEY || !process.env.API_SECRET) {
  throw new Error("no API keys");
}

const petfinder = pf({
  key: process.env.API_KEY,
  secret: process.env.API_SECRET
});

interface Props {
  location: string;
  animal: string;
  breed: string;
}

interface State {
  pets: PetType[];
}
class Results extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      pets: []
    };
  }

  public componentDidMount() {
    this.search();
  }

  public search = () => {
    petfinder.pet
      .find({
        output: "full",
        location: this.props.location,
        animal: this.props.animal,
        breed: this.props.breed
      })
      .then(data => {
        let pets;
        if (data.petfinder.pets && data.petfinder.pets.pet) {
          if (Array.isArray(data.petfinder.pets.pet)) {
            pets = data.petfinder.pets.pet;
          } else {
            pets = [data.petfinder.pets.pet];
          }
          this.setState({ pets });
        }
      });
  };
  public render() {
    return (
      <div className="search">
        <SearchBox search={this.search} />
        {this.state.pets.map(pet => {
          let breed;
          if (Array.isArray(pet.breeds.breed)) {
            breed = pet.breeds.breed.join(", ");
          } else {
            breed = pet.breeds.breed;
          }
          return (
            <Pet
              animal={pet.animal}
              name={pet.name}
              breed={breed}
              key={pet.id}
              id={pet.id}
              media={pet.media}
              location={`${pet.contact.city}, ${pet.contact.state}`}
            />
          );
        })}
      </div>
    );
  }
}

interface ReduxState {
  location: string;
  breed: string;
  animal: string;
}
const mapStateToProps = ({ location, breed, animal }: ReduxState) => ({
  animal,
  breed,
  location
});

export default connect(mapStateToProps)(Results);
