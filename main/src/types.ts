export default interface Campaign {
  owner: string;
  id: number;
  name: string;
  description: string;
  goal: number;
  deadline: number;
  raised: number;
  image: string;
  funders: { funder: string; amount: number }[];
  proposal: string;
  isWithdrawn: boolean;
}
