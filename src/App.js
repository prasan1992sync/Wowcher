import React, { useEffect, useState } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableFooter from "@material-ui/core/TableFooter";
import Paper from '@material-ui/core/Paper';
import search from './search.svg';
import "./App.css";

const formatNumber = (number) => new Intl.NumberFormat("en", { minimumFractionDigits: 2 }).format(number);

const App = () => {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState(null);
  const [loading, setLoading] = useState(true);

  const StyledTableCell = withStyles((theme) => ({
    head: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    body: {
      fontSize: 14,
    },
  }))(TableCell);
  
  const StyledTableRow = withStyles((theme) => ({
    root: {
      '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
      },
    },
  }))(TableRow);

  useEffect(() => {
    const branch1 = fetch("/api/branch1.json").then(res => res.json());
    const branch2 = fetch("/api/branch2.json").then(res => res.json());
    const branch3 = fetch("/api/branch3.json").then(res => res.json());

    const duplicateData = (prev, curr) => 
      prev?.name === curr?.name && prev?.id === curr?.id && prev?.unitPrice === curr?.unitPrice;

     (async () => {
        try {
          const filterData = (
            await Promise.all([branch1,branch2,branch3])
          )
          ?.reduce((prev, curr) =>  [...prev, ...(curr?.products ?? [])], [])
          ?.reduce((prev, curr) => {	
            const duplicate = prev?.find((item) => duplicateData(item, curr));
            if (!!duplicate) {
              return prev?.map((item) =>
                item === duplicate ? { ...duplicate, sold: item?.sold + curr?.sold } : item,
              );
            }
            return [...prev, curr];
          },[]);
          setProducts(filterData);
          setLoading(false);
        } 
        catch {

        }
     })();
  }, []);

  const searchGrocery = (name, query) => {
    query = query?.split('')?.reduce((a, b) => `${a}.*${b}`, '');
	  return new RegExp(query)?.test(name);
  }

  const searchedData = products?.filter(({ name }) => searchGrocery(name?.toLowerCase(), query?.toLowerCase()));

  return (
      <div style={{ width: "800px", float: "center"}}>
        <h1>Groceries</h1>
        <div className="product-list-search">
						<div className="product-list-search-input">
							<input
								id="search"
                placeholder="e.g. Apple"
                onChange={(e) => setQuery(e.target.value)}
								type="text"
							/>
							<img alt="Search icon" src={search} />
						</div>
				</div>
        {
          loading ? (<p>Loading....</p>) : !!searchedData?.length ? (
          <TableContainer component={Paper}>
          <Table>
              <TableHead>
                <TableRow>
                    <StyledTableCell>Product</StyledTableCell>
                    <StyledTableCell>Revenue</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                  {searchedData.map(({ id, name, sold, unitPrice }) => (
                    <StyledTableRow key={name}>
                      <TableCell key={id}>{name}</TableCell>
                      <TableCell key={name}>{formatNumber(sold * unitPrice)}</TableCell>
                    </StyledTableRow>
                  ))}
              </TableBody>
              <TableFooter>
                 <TableRow>
                    <StyledTableCell style={{ fontSize: "15px", color: "white", backgroundColor: "black"}}>Total</StyledTableCell>
                    <StyledTableCell style={{ fontSize: "15px", color: "white", backgroundColor: "black"}}>
											{/* reduce over filtered products, multiply sold and unitPrice to get
												revenue and add to accumulator in order to calculate total revenue */}
											{formatNumber(
												searchedData?.reduce(
													(acc, { sold, unitPrice }) => acc + sold * unitPrice,
													0,
												),
											)}
										</StyledTableCell>
                 </TableRow>
              </TableFooter>
          </Table>
        </TableContainer>
        ) : (<p>No Products....</p>)
        }
      </div>
  );
}


export default App;
