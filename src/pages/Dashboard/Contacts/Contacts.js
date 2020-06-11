import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Input,
  Row,
} from 'reactstrap';
import { compose } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { firestoreConnect } from 'react-redux-firebase';
import ReactPaginate from 'react-paginate';
import TableContent from '../../../components/TableContent';
import '../../../styles/pagination.css';


const pageSize = 20;

class Contacts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filterText: '',
      currentPage: 0,
    };
  }

  firstElement = () => this.state.currentPage * pageSize;

  lastElement = () => this.firstElement() + pageSize;

  filterContacts() {
    const uid = this.props.firebase.auth().currentUser.uid;
    let str = this.state.filterText;
    let filtered = this.props.contacts || [];
    filtered = filtered.filter((item) => item.userId === uid);

    // console.log('filterd uid', this.props.firebase.auth().currentUser.uid);

    if (str) {
      str = str.toLowerCase();
      filtered = filtered.filter(
        (a) => (a.name || '')
          .toLowerCase().includes(str)
          || (a.telephone || '')
            .toLowerCase().includes(str)
          || (a.email || '')
            .toLowerCase().includes(str),
      );
    }
    return filtered
      .slice()
      .sort((a, b) => (a.name > b.name ? 1 : -1));
  }

  render() {
    const filterContacts = this.filterContacts().slice(
      this.firstElement(),
      this.lastElement(),
    );

    return (
      <div className="animated fadeIn">
        <Row>
          <Col>
            <Card>
              <CardHeader>
                <i className="fa fa-align-justify" />
                {' '}
                Contacts
              </CardHeader>
              <CardBody>
                <Link to="/contacts/new">
                  <Button color="primary">Add New</Button>
                </Link>
                <br />
                <br />
                <Input
                  type="search"
                  placeholder="Filter"
                  value={this.state.filterText}
                  onChange={(e) => this.setState({
                    filterText: e.target.value,
                    currentPage: 0,
                  })}
                />
                <br />
                <TableContent
                  headers={[
                    { value: 'name', label: 'Name' },
                    { value: 'telephone', label: 'Telephone' },
                    { value: 'email', label: 'Email' },
                    // { value: 'testimonial_image', label: 'Photo', type: 'image' },
                    { label: 'See More', type: 'detail-button' },
                  ]}
                  content={filterContacts}
                  onClick={(item) => this.props.history.push(`/contacts/${item.id}`)}
                />
                <ReactPaginate
                  previousLabel="previous"
                  nextLabel="next"
                  breakLabel="..."
                  breakClassName="break-me"
                  pageCount={Math.ceil(this.filterContacts().length / pageSize)}
                  marginPagesDisplayed={2}
                  pageRangeDisplayed={5}
                  onPageChange={(page) => this.setState({ currentPage: page.selected })}
                  containerClassName="pagination"
                  subContainerClassName="pages pagination"
                  activeClassName="active"
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

Contacts.propTypes = {
  contacts: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  history: PropTypes.objectOf(PropTypes.oneOfType(PropTypes.any)).isRequired,
  firebase: PropTypes.objectOf(PropTypes.oneOfType(PropTypes.any)).isRequired,
};
Contacts.defaultProps = {
  contacts: [],
};
export default compose(
  firestoreConnect(() => [
    { collection: 'contacts' },
  ]),
  connect((state) => ({
    contacts: state.firestore.ordered.contacts ? state.firestore.ordered.contacts : [],
  })),
)(Contacts);