import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import Router from 'next/router';
import styled from 'styled-components';
import gql from 'graphql-tag';
import Form from './styles/Form';
import Loading from './styles/Loader';
import formatMoney from '../lib/formatMoney';
import Error from './ErrorMessage';

const UploadedImage = styled.img`
  margin-top: 1.5rem;
`;

const CREATE_ITEM_MUTATION = gql`
  mutation CREATE_ITEM_MUTATION(
    $title: String!
    $description: String!
    $price: Int!
    $image: String
    $largeImage: String
  ) {
    createItem(
      title: $title
      description: $description
      price: $price
      image: $image
      largeImage: $largeImage
    ) {
      id
    }
  }
`;

class CreateItem extends Component {
  state = {
    title: '',
    description: '',
    image: '',
    largeImage: '',
    price: 0,
    imageLoading: false
  };

  handleChange = event => {
    const { name, type, value } = event.target;
    const val = type === 'number' ? parseFloat(value) : value;
    this.setState({ [name]: val });
  };

  uploadFile = async ({ target: { files } }) => {
    this.setState({ imageLoading: true });

    const data = new FormData();

    data.append('upload_preset', 'sickfits');
    data.append('file', files[0]);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/dbomhtjgj/image/upload`,
        {
          method: 'POST',
          body: data
        }
      );

      const resFile = await response.json();

      this.setState({
        image: resFile.secure_url,
        largeImage: resFile.eager[0].secure_url,
        imageLoading: false
      });
    } catch (err) {
      this.setState({ imageLoading: false });
      console.log('err', err.message);
    }
  };

  render() {
    const { image, imageLoading, price, title, description } = this.state;

    return (
      <Mutation mutation={CREATE_ITEM_MUTATION} variables={this.state}>
        {(createItem, { loading, error }) => (
          <Form
            onSubmit={async event => {
              event.preventDefault();
              // call the mutation
              const response = await createItem();
              Router.push({
                pathname: '/item',
                query: { id: response.data.createItem.id }
              });
            }}
          >
            <h2>Create Item</h2>
            <Error error={error} />
            <fieldset disabled={loading} aria-busy={loading}>
              <label htmlFor="file">
                Image
                <input
                  id="file"
                  type="file"
                  name="file"
                  placeholder="Upload an Image"
                  onChange={this.uploadFile}
                />
                {image && !imageLoading && (
                  <UploadedImage src={image} alt="Preview" />
                )}
                {!image && imageLoading && <Loading />}
              </label>

              <label htmlFor="title">
                Title
                <input
                  type="text"
                  name="title"
                  placeholder="Title"
                  required
                  value={title}
                  onChange={this.handleChange}
                />
              </label>

              <label htmlFor="price">
                Price
                <input
                  type="number"
                  name="price"
                  placeholder="Price"
                  required
                  value={price}
                  onChange={this.handleChange}
                />
              </label>

              <label htmlFor="description">
                Description
                <input
                  type="textfield"
                  name="description"
                  placeholder="Enter A Description"
                  required
                  value={description}
                  onChange={this.handleChange}
                />
              </label>
              <button type="submit">Submit</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    );
  }
}

export default CreateItem;
export { CREATE_ITEM_MUTATION };
