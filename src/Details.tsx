import React from "react";
import pf, { PetResponse, PetMedia } from "petfinder-client";
import Loadable from "react-loadable";
import Carousel from "./Carousel";
import Modal from "./Modal";
import { RouteComponentProps, navigate } from "@reach/router";

if (!process.env.API_KEY || !process.env.API_SECRET) {
  throw new Error("no API keys");
}

const petfinder = pf({
  key: process.env.API_KEY,
  secret: process.env.API_SECRET
});

const LoadableContent = Loadable({
  loader: () => import("./AdoptModalContent"),
  loading: () => <h1>Loading adopt modal content</h1>
});

class Details extends React.Component<RouteComponentProps<{ id: string }>> {
  public state = {
    loading: true,
    showModal: false,
    name: "",
    animal: "",
    location: "",
    description: "",
    media: {} as PetMedia,
    breed: ""
  };

  public toggleModal = () =>
    this.setState({ showModal: !this.state.showModal });

  public componentDidMount() {
    if (!this.props.id) {
      return;
    }
    petfinder.pet
      .get({
        output: "full",
        id: this.props.id
      })
      .then((data: PetResponse) => {
        const pet = data.petfinder.pet;
        if (!pet) {
          navigate("/");
          return;
        }
        let breed;
        if (Array.isArray(pet.breeds.breed)) {
          breed = pet.breeds.breed.join(", ");
        } else {
          breed = pet.breeds.breed;
        }

        this.setState({
          name: pet.name,
          animal: pet.animal,
          location: `${pet.contact.city}, ${pet.contact.state}`,
          description: pet.description,
          media: pet.media,
          breed,
          loading: false
        });
      })
      .catch(err => {
        this.setState({ error: err });
      });
  }
  public render() {
    if (this.state.loading) {
      return <h1>loading...</h1>;
    }
    const {
      name,
      animal,
      breed,
      location,
      media,
      showModal,
      description
    } = this.state;
    return (
      <div className="details">
        <Carousel media={media} />
        <div>
          <h1>{name} </h1>
          <h2>
            {animal} — {breed} — {location}
          </h2>
          <button onClick={this.toggleModal}>Adopt {name}</button>
          <p>{description}</p>
          {showModal ? (
            <Modal>
              <LoadableContent toggleModal={this.toggleModal} name={name} />
            </Modal>
          ) : null}
        </div>
      </div>
    );
  }
}

export default Details;
